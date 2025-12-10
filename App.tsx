
import React, { useState, useMemo, useRef } from 'react';
import VoiceAgent from './components/VoiceAgent';
import { Agent, Campaign, CallLog, ApiKey, Contact } from './types';

// Icons
const LayoutDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const Users = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PhoneCall = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const Settings = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Megaphone = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const Play = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const History = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 6v6l4 2"/></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const X = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const Calendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;

// Mock Data
const MOCK_AGENTS: Agent[] = [
  { 
    id: 'ag_01', 
    name: 'Kredmint Support', 
    type: 'Inbound', 
    status: 'Active', 
    voice: 'Kore',
    systemInstruction: `You are a helpful and polite customer support agent for Kredmint.
Your goal is to assist customers with information about Kredmint's financial products and guide them on how to apply via the App or Web Portal.

Knowledge Base:
1. Kredmint Offers: Distribution/Retailer Finance, Invoice Discounting (ID), Pre-Invoice Discounting (PID), Supplier Invoice Discounting (SID), Term Loans.
2. App Features: Apply for loans, Upload docs, Track status, View repayment.
3. Onboarding: Download App -> Register -> KYC -> Choose Product -> Review -> Disbursal.

Speak in Hinglish or English.
If a user wants to apply, ask for name and mobile number to "Log an Inquiry".`
  },
  { id: 'ag_02', name: 'Lead Qualifier', type: 'Outbound', status: 'Inactive', voice: 'Puck', systemInstruction: 'You are a lead qualification agent...' },
  { id: 'ag_03', name: 'Collection Agent', type: 'Outbound', status: 'Active', voice: 'Fenrir', systemInstruction: 'You are a payment collection assistant...' }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cmp_01', name: 'Q1 Retailer Outreach', agentId: 'ag_02', status: 'Running', progress: 45, totalLeads: 2000, connected: 450, frequency: 'weekly' },
  { id: 'cmp_02', name: 'Overdue Reminders', agentId: 'ag_03', status: 'Scheduled', progress: 0, totalLeads: 500, connected: 0, frequency: 'daily' },
  { id: 'cmp_03', name: 'New Product Launch', agentId: 'ag_01', status: 'Completed', progress: 100, totalLeads: 1200, connected: 890, frequency: 'weekly' },
];

const INIT_LOGS: CallLog[] = [
  { id: 'call_9821', agentName: 'Kredmint Support', duration: '2m 14s', durationSeconds: 134, status: 'Completed', timestamp: '10:30 AM', date: new Date(Date.now() - 3600000), sentiment: 'Positive', sentimentReason: 'Customer successfully applied for ID.', transcript: [], recordingUrl: '' },
  { id: 'call_9820', agentName: 'Kredmint Support', duration: '45s', durationSeconds: 45, status: 'Failed', timestamp: '9:15 AM', date: new Date(Date.now() - 7200000), sentiment: 'Neutral', sentimentReason: 'Call dropped before product discussion.', transcript: [], recordingUrl: '' },
];

type View = 'dashboard' | 'agents' | 'campaigns' | 'settings' | 'playground' | 'calls';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>(INIT_LOGS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
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

  // Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly',
    scheduleTime: '10:00',
    startDate: '',
    agentId: '',
    file: null as File | null,
    contactCount: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file parsing logic
      // In a real backend, we would parse CSV/XLSX
      const mockCount = Math.floor(Math.random() * 500) + 50; // Random lead count for demo
      setNewCampaign(prev => ({ ...prev, file, contactCount: mockCount }));
    }
  };

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.agentId || !newCampaign.startDate || !newCampaign.file) {
      alert("Please fill all fields and upload a user list.");
      return;
    }

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
      startDate: newCampaign.startDate
      // In a real app, we'd upload newCampaign.file to the backend here
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
      contactCount: 0
    });
  };

  // Analytics derived from state "Backend"
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

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls', val: stats.totalCalls.toLocaleString(), change: '+12%', color: 'text-blue-400' },
          { label: 'Active Calls', val: currentView === 'playground' ? '1' : '0', change: 'Live', color: 'text-green-400', animate: true },
          { label: 'Avg Duration', val: formatSecs(stats.avgDuration), change: '-5%', color: 'text-slate-200' },
          { label: 'Success Rate', val: `${stats.successRate}%`, change: '+1.2%', color: 'text-purple-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 hover:border-slate-600 transition shadow-sm">
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-white">{stat.val}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-700/50 ${stat.color} ${stat.animate ? 'animate-pulse' : ''}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Call Volume (Last 7 Days)</h3>
          {/* Simple CSS Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
             {[45, 60, 35, 70,