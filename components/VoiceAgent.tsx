import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Schema, FunctionCall } from '@google/genai';
import { createBlob, decode, decodeAudioData, formatDuration } from '../utils/audio-utils';
import Visualizer from './Visualizer';
import { ChatMessage, Inquiry, PRODUCTS, CallLog } from '../types';

// Default Kredmint Instruction
const DEFAULT_SYSTEM_INSTRUCTION = `
You are a helpful and polite customer support agent for Kredmint.
Your goal is to assist customers with information about Kredmint's financial products and guide them on how to apply via the App or Web Portal.

Knowledge Base:
1. Kredmint Offers: Distribution/Retailer Finance, Invoice Discounting (ID), Pre-Invoice Discounting (PID), Supplier Invoice Discounting (SID), Term Loans.
2. App Features: Apply for loans, Upload docs, Track status, View repayment.
3. Onboarding: Download App -> Register -> KYC -> Choose Product -> Review -> Disbursal.

Speak in Hinglish or English.
If a user wants to apply, ask for name and mobile number to "Log an Inquiry".
`;

const logInquiryDeclaration: FunctionDeclaration = {
  name: 'logInquiry',
  description: 'Log a customer inquiry when they show interest in a product.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING, description: 'Name of the customer' },
      mobile: { type: Type.STRING, description: 'Mobile number of the customer' },
      product: { type: Type.STRING, description: 'Product they are interested in' }
    },
    required: ['customerName', 'mobile', 'product']
  }
};

interface VoiceAgentProps {
  apiKey: string;
  systemInstruction?: string;
  agentName?: string;
  onClose?: () => void;
  onSessionComplete?: (log: CallLog) => void;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ 
  apiKey, 
  systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
  agentName = "Kredmint Support",
  onClose,
  onSessionComplete
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for post-call processing
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Latency & Filler State
  const [latencyStatus, setLatencyStatus] = useState<'idle' | 'listening' | 'processing' | 'filler'>('idle');
  const turnEndTimestampRef = useRef<number>(0);
  const fillerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Transcription State
  const [realtimeTranscript, setRealtimeTranscript] = useState<ChatMessage[]>([]);
  const transcriptRef = useRef<ChatMessage[]>([]); 

  // Audio Processing Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const startTimeRef = useRef<number>(0);

  // Helper: Perform "Backend" Sentiment Analysis
  const analyzeSentiment = async (transcript: ChatMessage[]): Promise<{ sentiment: 'Positive' | 'Negative' | 'Neutral', reason: string }> => {
    if (transcript.length === 0) return { sentiment: 'Neutral', reason: 'No conversation detected.' };
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const conversationText = transcript.map(t => `${t.role}: ${t.text}`).join('\n');
      
      const prompt = `
        Analyze the following customer support conversation log. 
        Classify the final customer sentiment as "Positive", "Negative", or "Neutral".
        Provide a very short reason (max 1 sentence).
        
        Log:
        ${conversationText}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
              reason: { type: Type.STRING }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      return {
        sentiment: result.sentiment || 'Neutral',
        reason: result.reason || 'Analysis failed'
      };
    } catch (e) {
      console.error("Analysis failed", e);
      return { sentiment: 'Neutral', reason: 'Analysis error' };
    }
  };

  const connectToGemini = async () => {
    setError(null);
    setRealtimeTranscript([]);
    transcriptRef.current = [];
    startTimeRef.current = Date.now();
    setLatencyStatus('idle');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Setup Analysis
      analyserRef.current = outputContextRef.current!.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Setup Audio Output
      const outputNode = outputContextRef.current!.createGain();
      outputNode.connect(outputContextRef.current!.destination);
      outputNode.connect(analyserRef.current);

      // Setup Recording Destination (Mixer)
      recordingDestinationRef.current = outputContextRef.current!.createMediaStreamDestination();
      outputNode.connect(recordingDestinationRef.current);

      // Setup Input Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect Mic to Recorder 
      const micSourceForRecord = outputContextRef.current!.createMediaStreamSource(stream);
      micSourceForRecord.connect(recordingDestinationRef.current);

      // Start Recording
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(recordingDestinationRef.current.stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      // Setup GenAI Connection
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          tools: [{ functionDeclarations: [logInquiryDeclaration] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Connection Established");
            setIsConnected(true);
            
            // Setup Mic for API
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const processor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData, 16000);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Latency Logic: Response Received
            const isAudioMessage = !!message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (isAudioMessage) {
              setLatencyStatus('listening'); // Model is speaking, filler disabled
              if (fillerTimeoutRef.current) {
                clearTimeout(fillerTimeoutRef.current);
                fillerTimeoutRef.current = null;
              }
            }

            // Handle Audio Output
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
               const ctx = outputContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.addEventListener('ended', () => sourcesRef.current.delete(source));
               source.start(nextStartTimeRef.current);
               sourcesRef.current.add(source);
               nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle Transcription
            const inputTrans = message.serverContent?.inputTranscription?.text;
            const outputTrans = message.serverContent?.outputTranscription?.text;

            // Turn Handling for Latency Logic
            if (message.serverContent?.turnComplete) {
               // User finished speaking (or model finished turn, but usually indicates interaction point)
               // However, Live API `turnComplete` usually signifies Model is done.
               // We rely more on `inputAudioTranscription` + silence to detect user finish, 
               // but for this demo, we can assume if we just got a user transcript, we are waiting.
            }
            
            if (inputTrans) {
               // User just spoke. Start the "Filler" timer.
               setLatencyStatus('processing');
               if (fillerTimeoutRef.current) clearTimeout(fillerTimeoutRef.current);
               
               // 1.5s Threshold for Filler
               fillerTimeoutRef.current = setTimeout(() => {
                  setLatencyStatus('filler');
                  // In a real backend, we would inject audio here.
                  // For now, the UI will show "Speaking filler..."
               }, 1500);
            }

            if (inputTrans || outputTrans) {
              setRealtimeTranscript(prev => {
                const newMsg: ChatMessage = {
                   role: inputTrans ? 'user' : 'model',
                   text: (inputTrans || outputTrans)!,
                   timestamp: new Date().toLocaleTimeString(),
                   isFinal: true 
                };
                const updated = [...prev, newMsg];
                transcriptRef.current = updated;
                return updated;
              });
            }

            // Handle Tools
            if (message.toolCall) {
              // Reset filler if tool is called (processing is happening)
              setLatencyStatus('processing'); 
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'logInquiry') {
                  const args = fc.args as any;
                  const newInquiry: Inquiry = {
                    id: Math.random().toString(36).substring(7).toUpperCase(),
                    customerName: args.customerName,
                    mobile: args.mobile,
                    product: args.product,
                    timestamp: new Date(),
                    status: 'logged'
                  };
                  setInquiries(prev => [newInquiry, ...prev]);
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Inquiry logged successfully. Reference ID: " + newInquiry.id }
                      }
                    });
                  });
                }
              }
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setLatencyStatus('listening');
            }
          },
          onclose: () => {
             setIsConnected(false);
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection error");
            setIsConnected(false);
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize");
      setIsConnected(false);
    }
  };

  const disconnect = useCallback(async () => {
    // 1. Stop Recorder and wait for blob
    let audioUrl = '';
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise<void>(resolve => {
        if (!mediaRecorderRef.current) return resolve();
        mediaRecorderRef.current.onstop = () => resolve();
        mediaRecorderRef.current.stop();
      });
      const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      audioUrl = URL.createObjectURL(audioBlob);
    }

    // 2. Perform "Backend" Processing (Sentiment Analysis)
    setIsConnected(false);
    setIsAnalyzing(true);
    
    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    const finalTranscript = transcriptRef.current;
    
    // Call the "Backend" (simulated via API)
    const analysis = await analyzeSentiment(finalTranscript);

    const log: CallLog = {
      id: 'call_' + Math.random().toString(36).substr(2, 9),
      agentName: agentName,
      duration: formatDuration(durationSec),
      durationSeconds: durationSec,
      status: durationSec > 5 ? 'Completed' : 'Failed',
      timestamp: new Date().toLocaleTimeString(),
      date: new Date(),
      sentiment: analysis.sentiment,
      sentimentReason: analysis.reason,
      transcript: finalTranscript,
      recordingUrl: audioUrl
    };

    if (onSessionComplete) {
      onSessionComplete(log);
    }

    // 3. Cleanup Audio Contexts
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    setIsAnalyzing(false);
    if (fillerTimeoutRef.current) clearTimeout(fillerTimeoutRef.current);
    if (onClose) onClose();

  }, [agentName, onSessionComplete, onClose, apiKey]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
        if (isConnected) {
           // We can't do async disconnect cleanly on unmount easily without a ref, 
           // but we can try to close resources.
           if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
           if (inputContextRef.current) inputContextRef.current.close();
           if (outputContextRef.current) outputContextRef.current.close();
        }
    };
  }, [isConnected]);

  // Helper for Latency UI
  const getStatusMessage = () => {
    if (isAnalyzing) return "Analyzing Sentiment...";
    if (!isConnected) return "Disconnected";
    if (latencyStatus === 'filler') return "Bot is thinking... (Filler: 'Just a moment')";
    if (latencyStatus === 'processing') return "Processing...";
    return "Listening / Speaking";
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : isAnalyzing ? 'bg-yellow-500 animate-bounce' : 'bg-red-500'}`} />
            {agentName}
          </h2>
          <p className="text-xs text-slate-400">
             {getStatusMessage()}
          </p>
        </div>
        {/* Only show close if not analyzing */}
        {!isAnalyzing && onClose && (
          <button onClick={disconnect} className="text-slate-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Visualizer & Controls */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />
             
             <Visualizer analyser={analyserRef.current} isActive={isConnected} />
             
             {/* Latency/Filler Indicator */}
             {latencyStatus === 'filler' && (
               <div className="absolute top-4 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse border border-yellow-500/50">
                 System: Sending Filler Audio...
               </div>
             )}

             <div className="mt-8 z-10">
               {!isConnected && !isAnalyzing ? (
                  <button
                    onClick={connectToGemini}
                    className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-105 flex items-center gap-3"
                  >
                    <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Start Conversation
                  </button>
               ) : isAnalyzing ? (
                  <div className="flex items-center gap-3 px-8 py-3 text-white">
                    <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Sentiment...
                  </div>
               ) : (
                  <button
                    onClick={disconnect}
                    className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-full font-semibold transition-all flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    End Session
                  </button>
               )}
             </div>
             {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex-1 overflow-y-auto max-h-[300px]">
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Transcript</h3>
             <div className="space-y-3">
                {realtimeTranscript.length === 0 && <p className="text-slate-500 text-sm italic">Waiting for conversation...</p>}
                {realtimeTranscript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                        : 'bg-slate-700/50 text-slate-200 border border-slate-600'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Real-time Data Panel */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-4 bg-slate-800 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Live Actions
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {inquiries.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  No actions captured yet.
                  <br/>
                  <span className="text-xs opacity-60">Ask the agent to "Log an inquiry"</span>
                </div>
              ) : (
                inquiries.map(inq => (
                  <div key={inq.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-blue-300 font-mono text-[10px]">#{inq.id}</span>
                      <span className="text-[10px] text-slate-400">{inq.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm text-white font-medium mb-0.5">{inq.product}</div>
                    <div className="text-xs text-slate-300">{inq.customerName}</div>
                    <div className="text-xs text-slate-400">{inq.mobile}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;