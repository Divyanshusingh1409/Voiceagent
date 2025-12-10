import React, { useState, useMemo, useRef, useEffect } from 'react';
import VoiceAgent from './components/VoiceAgent';
import { Agent, Campaign, CallLog, ApiKey, Contact, PRODUCTS } from './types';

// --- Icons ---
const LayoutDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const Users = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PhoneCall = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Megaphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const Play = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const History = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 6v6l4 2"/></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const X = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const Calendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const Trash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const Edit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const FileAudio = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11.5"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M6 16h2"/></svg>;

// --- Mock Data ---
const MOCK_AGENTS: Agent[] = [
  { 
    id: 'ag_01', 
    name: 'Kredmint Support', 
    type: 'Inbound', 
    status: 'Active', 
    voice: 'Kore',
    initialMessage: "Hello! Welcome to Kredmint. How can I help you with your financing needs today?",
    systemInstruction: `You are a helpful and polite customer support agent for Kredmint.
Your goal is to assist customers with information about Kredmint's financial products and guide them on how to apply via the App or Web Portal.

Knowledge Base:
1. Kredmint Offers: Distribution/Retailer Finance, Invoice Discounting (ID), Pre-Invoice Discounting (PID), Supplier Invoice Discounting (SID), Term Loans.
2. App Features: Apply for loans, Upload docs, Track status, View repayment.
3. Onboarding: Download App -> Register -> KYC -> Choose Product -> Review -> Disbursal.

Speak in Hinglish or English.
If a user wants to apply, ask for name and mobile number to "Log an Inquiry".`
  },
  { id: 'ag_02', name: 'Lead Qualifier', type: 'Outbound', status: 'Inactive', voice: 'Puck', initialMessage: "Hi, this is Kredmint calling. Am I speaking with the business owner?", systemInstruction: 'You are a lead qualification agent for Kredmint. Ask about turnover and business vintage.' },
  { id: 'ag_03', name: 'Collection Agent', type: 'Outbound', status: 'Active', voice: 'Fenrir', initialMessage: "Good morning. This is a payment reminder from Kredmint.", systemInstruction: 'You are a payment collection assistant. Be polite but firm about upcoming due dates.' }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cmp_01', name: 'Q1 Retailer Outreach', agentId: 'ag_02', status: 'Running', progress: 45, totalLeads: 2000, connected: 450, frequency: 'weekly', scheduleTime: '09:00', startDate: '2024-03-01' },
  { id: 'cmp_02', name: 'Overdue Reminders', agentId: 'ag_03', status: 'Scheduled', progress: 0, totalLeads: 500, connected: 0, frequency: 'daily', scheduleTime: '14:00', startDate: '2024-03-05' },
  { id: 'cmp_03', name: 'New Product Launch', agentId: 'ag_01', status: 'Completed', progress: 100, totalLeads: 1200, connected: 890, frequency: 'weekly', scheduleTime: '10:00', startDate: '2024-02-15' },
];

const INIT_LOGS: CallLog[] = [
  { id: 'call_9821', agentName: 'Kredmint Support', duration: '2m 14s', durationSeconds: 134, status: 'Completed', timestamp: '10:30 AM', date: new Date(Date.now() - 3600000), sentiment: 'Positive', sentimentReason: 'Customer successfully applied for ID.', transcript: [], recordingUrl: '' },
  { id: 'call_9820', agentName: 'Kredmint Support', duration: '45s', durationSeconds: 45, status: 'Failed', timestamp: '9:15 AM', date: new Date(Date.now() - 7200000), sentiment: 'Neutral', sentimentReason: 'Call dropped before product discussion.', transcript: [], recordingUrl: '' },
];

type View = 'dashboard' | 'agents' | 'campaigns' | 'settings' | 'playground' | 'calls';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS); 
  const [callLogs, setCallLogs] = useState<CallLog[]>(INIT_LOGS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  // Agent Modal State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'key_01', name: 'Production Key', key: 'sk-prod-••••••••', created: '2023-10-01', lastUsed: 'Just now' },
    { id: 'key_02', name: 'Dev Key', key: 'sk-dev-••••••••', created: '2024-01-15', lastUsed: '2 days ago' }
  ]);

  const apiKey = process.env.API_KEY || '';

  const handleTestAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setCurrentView('playground');
  };

  const handleSessionComplete = (log: CallLog) => {
    setCallLogs(prev => [log, ...prev]);
  };
  
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent({ ...agent });
    setShowAgentModal(true);
  };

  const handleCreateAgent = () => {
    setEditingAgent({
      id: `ag_${Math.random().toString(36).substr(2, 6)}`,
      name: '',
      type: 'Inbound',
      status: 'Active',
      voice: 'Kore',
      systemInstruction: '',
      initialMessage: ''
    });
    setShowAgentModal(true);
  };

  const handleDeleteAgent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSaveAgent = () => {
    if (editingAgent) {
      setAgents(prev => {
        const exists = prev.some(a => a.id === editingAgent.id);
        if (exists) {
           // Update existing
           return prev.map(a => a.id === editingAgent.id ? editingAgent : a);
        } else {
           // Create new
           return [...prev, editingAgent];
        }
      });
      setShowAgentModal(false);
      setEditingAgent(null);
    }
  };

  // Campaign Form State
  const [campaignStep, setCampaignStep] = useState<'form' | 'summary'>('form');
  const [previewContacts, setPreviewContacts] = useState<Contact[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly',
    scheduleTime: '10:00',
    startDate: '',
    agentId: '',
    file: null as File | null,
    contactCount: 0,
    agentPromptOverride: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockCount = Math.floor(Math.random() * 500) + 50; 
      const mocks: Contact[] = [
         { name: "Rahul Sharma", phone: "+91 98765 43210" },
         { name: "Priya Verma", phone: "+91 99887 76655" },
         { name: "Amit Singh", phone: "+91 91234 56789" },
         { name: "Sneha Gupta", phone: "+91 98765 12345" },
         { name: "Vikram Malhotra", phone: "+91 99999 88888" }
      ];
      setPreviewContacts(mocks);
      setNewCampaign(prev => ({ ...prev, file, contactCount: mockCount }));
    }
  };

  const handleCampaignNext = () => {
    if (!newCampaign.name || !newCampaign.agentId || !newCampaign.startDate || !newCampaign.file) {
      alert("Please fill all required fields and upload a user list.");
      return;
    }
    if (!newCampaign.agentPromptOverride.trim()) {
      alert("Please provide an override prompt for the campaign agent.");
      return;
    }
    setCampaignStep('summary');
  };

  const createCampaign = () => {
    const campaign: Campaign = {
      id: `cmp_${Math.random().toString(36).substr(2, 5)}`,
      name: newCampaign.name,
      agentId: newCampaign.agentId,
      status: 'Scheduled',
      progress: 0,
      totalLeads: newCampaign.contactCount,
      connected: 0,
      frequency: newCampaign.frequency,
      scheduleTime: newCampaign.scheduleTime,
      startDate: newCampaign.startDate,
      agentPromptOverride: newCampaign.agentPromptOverride,
      contactList: previewContacts
    };

    setCampaigns(prev => [campaign, ...prev]);
    setShowCampaignModal(false);
    setNewCampaign({
      name: '',
      frequency: 'daily',
      scheduleTime: '10:00',
      startDate: '',
      agentId: '',
      file: null,
      contactCount: 0,
      agentPromptOverride: ''
    });
    setCampaignStep('form');
  };

  const stats = useMemo(() => {
    const totalCalls = callLogs.length;
    const totalDuration = callLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const avgDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;
    const completed = callLogs.filter(c => c.status === 'Completed').length;
    const successRate = totalCalls > 0 ? ((completed / totalCalls) * 100).toFixed(1) : '0';

    return { totalCalls, avgDuration, successRate };
  }, [callLogs]);

  const formatSecs = (s: number) => {
     const m = Math.floor(s / 60);
     const sec = s % 60;
     return `${m}m ${sec}s`;
  };

  const downloadTranscript = (call: CallLog) => {
    const text = call.transcript.map(t => `[${t.timestamp}] ${t.role}: ${t.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${call.id}.txt`;
    a.click();
  };

  const downloadRecording = (call: CallLog) => {
    if (!call.recordingUrl) return;
    const a = document.createElement('a');
    a.href = call.recordingUrl;
    // Guess extension based on browser - usually webm
    a.download = `recording-${call.id}.webm`;
    a.click();
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls', val: stats.totalCalls.toLocaleString(), change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Calls', val: currentView === 'playground' ? '1' : '0', change: 'Live', color: 'text-green-600', bg: 'bg-green-50', animate: true },
          { label: 'Avg Duration', val: formatSecs(stats.avgDuration), change: '-5%', color: 'text-gray-500', bg: 'bg-gray-100' },
          { label: 'Success Rate', val: `${stats.successRate}%`, change: '+1.2%', color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition shadow-sm">
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.val}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.bg} ${stat.color} ${stat.animate ? 'animate-pulse' : ''}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Volume (Last 7 Days)</h3>
          <div className="flex items-end justify-between h-48 gap-2">
             {[45, 60, 35, 70, 55, 80, 65].map((h, i) => (
               <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-lg transition relative group" style={{ height: `${h}%` }}>
                 <div className="absolute bottom-0 w-full bg-blue-500 opacity-20 h-full rounded-t-lg"></div>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{h} calls</div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
             {callLogs.slice(0, 5).map(log => (
               <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-100" onClick={() => setSelectedCall(log)}>
                  <div className={`p-2 rounded-full ${log.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <PhoneCall />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.agentName}</p>
                    <p className="text-xs text-gray-500">{log.timestamp} • {log.duration}</p>
                  </div>
                  <div className="ml-auto text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {log.sentiment}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaignForm = () => (
    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
        <input 
          type="text" 
          value={newCampaign.name}
          onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="e.g. Summer Outreach"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <select 
             value={newCampaign.frequency}
             onChange={e => setNewCampaign({...newCampaign, frequency: e.target.value as any})}
             className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
           <input 
            type="time" 
            value={newCampaign.scheduleTime}
            onChange={e => setNewCampaign({...newCampaign, scheduleTime: e.target.value})}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
           />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <div className="relative">
          <input 
            type="date"
            value={newCampaign.startDate}
            onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none pl-10" 
          />
          <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"><Calendar /></div>
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent</label>
         <select 
            value={newCampaign.agentId}
            onChange={e => {
              setNewCampaign({...newCampaign, agentId: e.target.value});
            }}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
         >
           <option value="">Select an Agent</option>
           {agents.map(ag => <option key={ag.id} value={ag.id}>{ag.name} ({ag.type})</option>)}
         </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Agent Prompt (Override)</label>
        <p className="text-xs text-gray-500 mb-2">
           Strictly defines what the agent will say for this campaign. Overrides default agent instructions.
        </p>
        <textarea 
          value={newCampaign.agentPromptOverride}
          onChange={e => setNewCampaign({...newCampaign, agentPromptOverride: e.target.value})}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none h-32 font-mono text-sm resize-none"
          placeholder="Enter strict instructions for this campaign..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User List (CSV/Excel)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
           <input 
              type="file" 
              accept=".csv, .xlsx" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
           />
           <div className="text-gray-400 mb-2"><UploadIcon /></div>
           <p className="mt-2 text-sm text-gray-600">{newCampaign.file ? newCampaign.file.name : "Drag & drop or click to upload"}</p>
           {newCampaign.contactCount > 0 && (
              <p className="text-xs text-green-600 mt-1">{newCampaign.contactCount} contacts found</p>
           )}
        </div>
      </div>
    </div>
  );

  const renderCampaignSummary = () => {
    const agentName = agents.find(a => a.id === newCampaign.agentId)?.name || "Unknown Agent";
    
    return (
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
         <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Campaign Name</p>
              <p className="font-medium text-gray-900">{newCampaign.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Agent</p>
              <p className="font-medium text-gray-900">{agentName}</p>
            </div>
            <div>
              <p className="text-gray-500">Schedule</p>
              <p className="font-medium text-gray-900 capitalize">{newCampaign.frequency} at {newCampaign.scheduleTime}</p>
            </div>
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900">{newCampaign.startDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Contacts</p>
              <p className="font-medium text-green-600">{newCampaign.contactCount}</p>
            </div>
         </div>

         <div>
           <h4 className="text-sm font-semibold text-gray-900 mb-2">Agent Prompt Override</h4>
           <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600 font-mono italic shadow-sm">
             "{newCampaign.agentPromptOverride}"
           </div>
         </div>

         <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Sample Contacts (Preview)</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
               <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewContacts.map((c, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-3 py-2 text-gray-900">{c.name}</td>
                        <td className="px-3 py-2 text-gray-500">{c.phone}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Kredmint.ai</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
            { id: 'agents', label: 'AI Agents', icon: <Users /> },
            { id: 'campaigns', label: 'Campaigns', icon: <Megaphone /> },
            { id: 'calls', label: 'Call History', icon: <History /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">
             {currentView === 'playground' ? `Live Session: ${activeAgent?.name}` : currentView.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          
          {currentView === 'dashboard' && renderDashboard()}

          {currentView === 'agents' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Your Agents</h2>
                  <button 
                    onClick={handleCreateAgent}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-sm"
                  >
                    <Plus /> Create New Agent
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {agents.map(agent => (
                 <div key={agent.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition group shadow-sm">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${agent.type === 'Inbound' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                           <Users />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditAgent(agent)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200" title="Edit Agent">
                             <Edit />
                          </button>
                          <button onClick={() => handleDeleteAgent(agent.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition border border-gray-200" title="Delete Agent">
                             <Trash />
                          </button>
                          <span className={`text-xs px-2 py-2 rounded-lg border flex items-center ${agent.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{agent.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{agent.type} Agent • Voice: {agent.voice}</p>
                      
                      {/* Initial Message Preview */}
                      {agent.initialMessage && (
                        <div className="mb-3">
                           <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Starts with:</p>
                           <p className="text-xs text-gray-600 italic truncate">"{agent.initialMessage}"</p>
                        </div>
                      )}

                      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono mb-6 line-clamp-3 border border-gray-100">
                        {agent.systemInstruction}
                      </div>
                      <button 
                        onClick={() => handleTestAgent(agent)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                      >
                        <Play /> Test Agent
                      </button>
                    </div>
                 </div>
               ))}
               </div>
            </div>
          )}

          {currentView === 'playground' && activeAgent && (
             <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <VoiceAgent 
                  apiKey={apiKey}
                  agentName={activeAgent.name}
                  initialMessage={activeAgent.initialMessage}
                  systemInstruction={activeAgent.systemInstruction}
                  onClose={() => setCurrentView('agents')}
                  onSessionComplete={handleSessionComplete}
                />
             </div>
          )}

          {currentView === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
                <button 
                  onClick={() => {
                    setShowCampaignModal(true);
                    setCampaignStep('form');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-sm"
                >
                  <Plus /> Create Campaign
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Campaign Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Schedule</th>
                      <th className="px-6 py-4">Progress</th>
                      <th className="px-6 py-4 text-right">Leads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map(cmp => (
                      <tr key={cmp.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{cmp.name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            cmp.status === 'Running' ? 'bg-green-100 text-green-600' :
                            cmp.status === 'Completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cmp.frequency ? (
                            <div className="flex flex-col">
                              <span className="capitalize">{cmp.frequency} at {cmp.scheduleTime}</span>
                              <span className="text-xs text-gray-400">Starts {cmp.startDate}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cmp.progress}%` }}></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{cmp.progress}%</div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">{cmp.totalLeads.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'calls' && (
             <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Date/Time</th>
                        <th className="px-6 py-4">Agent</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Sentiment</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {callLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition group">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="font-medium text-gray-900">{log.date.toLocaleDateString()}</div>
                            <div className="text-gray-400">{log.timestamp}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{log.agentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{log.duration}</td>
                          <td className="px-6 py-4">
                             <span className={`text-xs px-2 py-1 rounded-full ${log.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{log.status}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-xs px-2 py-1 rounded-full ${
                                log.sentiment === 'Positive' ? 'bg-green-100 text-green-600' : 
                                log.sentiment === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                             }`}>
                               {log.sentiment}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedCall(log)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             </div>
          )}

          {currentView === 'settings' && (
             <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">API Key Management</h2>
                  <div className="space-y-4">
                     {apiKeys.map(key => (
                       <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900">{key.name}</p>
                            <p className="text-sm text-gray-500 font-mono mt-1">{key.key}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                             <span>Last used: {key.lastUsed}</span>
                             <button className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded">
                               <Trash />
                             </button>
                          </div>
                       </div>
                     ))}
                     <button className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <Plus /> Generate New Key
                     </button>
                  </div>
                </div>
             </div>
          )}
        </div>
      </main>

      {/* --- Modals --- */}
      
      {/* Agent Edit Modal */}
      {showAgentModal && editingAgent && (
         <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-900">
                    {agents.some(a => a.id === editingAgent.id) ? 'Edit AI Agent' : 'Create AI Agent'}
                 </h3>
                 <button onClick={() => setShowAgentModal(false)} className="text-gray-400 hover:text-gray-700"><X /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                       <input 
                         type="text"
                         value={editingAgent.name}
                         onChange={e => setEditingAgent({...editingAgent, name: e.target.value})}
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Voice Persona</label>
                       <select 
                         value={editingAgent.voice}
                         onChange={e => setEditingAgent({...editingAgent, voice: e.target.value})}
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                       >
                         <option value="Kore">Kore</option>
                         <option value="Puck">Puck</option>
                         <option value="Fenrir">Fenrir</option>
                         <option value="Charon">Charon</option>
                         <option value="Aoede">Aoede</option>
                       </select>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Message</label>
                    <p className="text-xs text-gray-500 mb-2">The very first thing the bot will say when the call connects.</p>
                    <textarea 
                      value={editingAgent.initialMessage || ''}
                      onChange={e => setEditingAgent({...editingAgent, initialMessage: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none h-20 resize-none"
                      placeholder="e.g. Hello, thanks for calling Kredmint..."
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Instructions (System Prompt)</label>
                    <p className="text-xs text-gray-500 mb-2">Define the bot's behavior, knowledge base, and tone.</p>
                    <textarea 
                      value={editingAgent.systemInstruction}
                      onChange={e => setEditingAgent({...editingAgent, systemInstruction: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none h-48 font-mono text-sm"
                    />
                 </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                 <button onClick={() => setShowAgentModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
                 <button onClick={handleSaveAgent} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20">
                    Save Changes
                 </button>
              </div>
            </div>
         </div>
      )}

      {/* Campaign Creation Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {campaignStep === 'form' ? 'Create New Campaign' : 'Confirm Campaign'}
              </h3>
              <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-gray-700"><X /></button>
            </div>
            
            {campaignStep === 'form' ? renderCampaignForm() : renderCampaignSummary()}

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
               <button 
                  onClick={() => setShowCampaignModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
               >
                 Cancel
               </button>
               
               <div className="flex gap-3">
                 {campaignStep === 'summary' && (
                   <button 
                     onClick={() => setCampaignStep('form')}
                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                   >
                     <ArrowLeft /> Edit
                   </button>
                 )}
                 
                 {campaignStep === 'form' ? (
                   <button 
                     onClick={handleCampaignNext}
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                   >
                     Next <ArrowRight />
                   </button>
                 ) : (
                   <button 
                     onClick={createCampaign}
                     className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg shadow-green-500/20 flex items-center gap-2"
                   >
                     <Megaphone /> Confirm & Start
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                       Call Details <span className="text-sm font-normal text-gray-500 font-mono">#{selectedCall.id}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedCall.date.toLocaleString()}</p>
                 </div>
                 <button onClick={() => setSelectedCall(null)} className="text-gray-400 hover:text-gray-700"><X /></button>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                 {/* Sidebar Info */}
                 <div className="w-full md:w-72 bg-gray-50 border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                    <div>
                       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outcome</h4>
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedCall.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedCall.status}</span>
                          <span className="text-gray-500 text-sm">{selectedCall.duration}</span>
                       </div>
                    </div>

                    <div>
                       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sentiment Analysis</h4>
                       <div className={`p-3 rounded-lg border ${
                          selectedCall.sentiment === 'Positive' ? 'bg-green-50 border-green-200' : 
                          selectedCall.sentiment === 'Negative' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                       }`}>
                          <div className={`font-medium mb-1 ${
                             selectedCall.sentiment === 'Positive' ? 'text-green-700' : 
                             selectedCall.sentiment === 'Negative' ? 'text-red-700' : 'text-gray-700'
                          }`}>
                            {selectedCall.sentiment}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{selectedCall.sentimentReason || "No detailed analysis available."}</p>
                       </div>
                    </div>

                    <div>
                       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recording</h4>
                       {selectedCall.recordingUrl ? (
                         <>
                           <audio controls src={selectedCall.recordingUrl} className="w-full h-8 mt-1" />
                           <button 
                             onClick={() => downloadRecording(selectedCall)}
                             className="w-full mt-2 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition"
                           >
                             <FileAudio /> Download Audio
                           </button>
                         </>
                       ) : (
                         <p className="text-xs text-gray-500 italic">No recording available</p>
                       )}
                    </div>
                    
                    <button 
                      onClick={() => downloadTranscript(selectedCall)}
                      className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center gap-2 transition"
                    >
                      <Download /> Download Transcript
                    </button>
                 </div>

                 {/* Transcript */}
                 <div className="flex-1 p-6 overflow-y-auto bg-white">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 sticky top-0 bg-white py-2">Conversation Log</h4>
                    <div className="space-y-4">
                       {selectedCall.transcript.length === 0 && <p className="text-gray-500 italic text-sm">No transcript available for this call.</p>}
                       {selectedCall.transcript.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-blue-600 text-white rounded-tr-none' 
                                  : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-none'
                             }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.timestamp}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;