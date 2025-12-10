import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio-utils';
import Visualizer from './Visualizer';
import { ChatMessage, Order, MENU_ITEMS } from '../types';

// System instruction for the "Barista" persona
const SYSTEM_INSTRUCTION = `
You are a friendly and efficient barista at "Star Bots Cafe".
Your goal is to take orders from customers.
The menu is: 
${MENU_ITEMS.map(i => `- ${i.name}: $${i.price}`).join('\n')}

- Be conversational but concise.
- When a user confirms an order, use the "placeOrder" tool.
- If the user asks for something not on the menu, politely apologize and suggest an alternative.
- Keep your responses short and suitable for voice interaction.
`;

// Tool definition for placing an order
const placeOrderDeclaration: FunctionDeclaration = {
  name: 'placeOrder',
  description: 'Place a customer order with a list of items and quantities.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'List of items ordered',
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING, description: 'Name of the item (e.g., Coffee, Tea)' },
            quantity: { type: Type.NUMBER, description: 'Number of items' },
            notes: { type: Type.STRING, description: 'Optional special instructions (e.g. no sugar)' }
          },
          required: ['item', 'quantity']
        }
      }
    },
    required: ['items']
  }
};

interface VoiceAgentProps {
  apiKey: string;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ apiKey }) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); // Type 'LiveSession' not exported directly, using any for handle

  // Playback state
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper to append messages safely
  const addMessage = (role: 'user' | 'model' | 'system', text: string, isFinal: boolean = false) => {
    setMessages(prev => {
      // If the last message is from the same role and not final, update it (streaming effect)
      // However, Live API transcriptions come in chunks.
      // For simplicity in this demo, we push new messages or update the last 'partial' one.
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.role === role && !lastMsg.isFinal && !isFinal) {
         // This logic is tricky with Live API because input/output are async.
         // We will just append purely for the log to avoid complex merging logic in this demo.
         // A more robust chat UI would merge partials.
         return [...prev]; 
      }
      return [...prev, { role, text, isFinal }];
    });
  };

  const connectToGemini = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // 1. Setup Audio Contexts
      // Input: 16kHz for better speech recognition compatibility
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output: 24kHz for Gemini default output
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Visualizer Analyser
      analyserRef.current = outputContextRef.current!.createAnalyser();
      analyserRef.current.fftSize = 256;

      // 2. Connect Output Node
      const outputNode = outputContextRef.current!.createGain();
      outputNode.connect(outputContextRef.current!.destination);
      outputNode.connect(analyserRef.current); // Connect to visualizer

      // 3. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          tools: [{ functionDeclarations: [placeOrderDeclaration] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Connection Established");
            setIsConnected(true);
            setMessages([{ role: 'system', text: 'Connected to Gemini Live Agent' }]);

            // Setup Input Processing
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const processor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData, 16000);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
               const ctx = outputContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(audioData),
                 ctx,
                 24000,
                 1
               );

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });

               source.start(nextStartTimeRef.current);
               sourcesRef.current.add(source);
               nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
               // Showing real-time user transcription can be noisy, we might just log 'turnComplete' for cleaner UI
            }
            
            if (message.serverContent?.turnComplete) {
              // Note: In a real app you'd aggregate input/output transcription from the stream
              // For now, we rely on the turnComplete event if available, or just ignore for audio-focus
              // Currently turnComplete doesn't carry full text history, we have to accumulate it.
              // To keep it simple, we won't rigorously display the text log since the goal is *voice* agent.
              // But let's log connection status or major events.
            }

            // Handle Tool Calls (Order Placement)
            if (message.toolCall) {
              console.log("Tool Call Received:", message.toolCall);
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'placeOrder') {
                  const args = fc.args as any;
                  const newOrder: Order = {
                    id: Math.random().toString(36).substring(7),
                    items: args.items,
                    status: 'confirmed',
                    total: args.items.reduce((acc: number, item: any) => {
                      const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase() === item.item.toLowerCase());
                      return acc + (menuItem ? menuItem.price * item.quantity : 0);
                    }, 0),
                    timestamp: new Date()
                  };

                  setOrders(prev => [newOrder, ...prev]);
                  
                  // Send response back to model
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Order placed successfully. ID: " + newOrder.id }
                      }
                    });
                  });
                }
              }
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log("Model interrupted");
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Connection Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Connection Error:", err);
            setError("Connection error occurred. Please check console.");
            setIsConnected(false);
          }
        }
      });
      
      // Store session promise for cleanup if needed (though we mostly use sessionRef.current pattern if we awaited it)
      // Here we rely on the promise in callbacks.

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize");
      setIsConnected(false);
    }
  };

  const disconnect = useCallback(() => {
    // 1. Stop Microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // 2. Disconnect Script Processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    // 3. Close Audio Contexts
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    // 4. Reset State
    setIsConnected(false);
    // Note: We can't explicitly 'close' the session from the client side easily 
    // without the session object returned by promise, which is handled in closure.
    // Reloading or just stopping the audio inputs effectively kills the interaction.
    // For a production app, you'd store the session object to call .close() on it.
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 gap-6">
      
      {/* Header / Status */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">☕</span> Star Bots Voice Agent
          </h1>
          <p className="text-slate-400 text-sm">Gemini 2.5 Flash Native Audio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-slate-300">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Control Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Controls & Visualizer */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-6 min-h-[300px]">
            <Visualizer analyser={analyserRef.current} isActive={isConnected} />
            
            {!isConnected ? (
              <button
                onClick={connectToGemini}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full font-bold shadow-lg transform transition hover:scale-105 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Conversation
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-8 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-full font-bold transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Session
              </button>
            )}
            
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                {error}
              </div>
            )}
            
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Try saying:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">"One coffee please"</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">"What do you have?"</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">"I'll take two croissants"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Orders & Menu */}
        <div className="flex flex-col gap-4">
            {/* Active Orders Panel */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-1 overflow-hidden flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </h2>
              
              <div className="overflow-y-auto scrollbar-hide space-y-3 flex-1 h-64">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No orders yet</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-indigo-300 font-mono text-xs">#{order.id}</span>
                        <span className="text-xs text-slate-400">{order.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <ul className="space-y-1 mb-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-200 flex justify-between">
                            <span>{item.quantity}x {item.item}</span>
                            {item.notes && <span className="text-xs text-slate-400 italic">({item.notes})</span>}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 border-t border-slate-600 flex justify-between items-center">
                        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">{order.status}</span>
                        <span className="text-sm font-bold text-white">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Menu Reference */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Menu</h3>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 {MENU_ITEMS.map(item => (
                   <div key={item.name} className="flex justify-between text-slate-300">
                     <span>{item.name}</span>
                     <span className="text-slate-500">${item.price}</span>
                   </div>
                 ))}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
