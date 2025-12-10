
import React, { useState, useMemo, useEffect } from 'react';
import VoiceAgent from './components/VoiceAgent';
import { Agent, Campaign, CallLog, ApiKey, Contact, SipConfig } from './types';
import { api } from './services/api';

// --- Icons ---
const LayoutDashboard = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const Users = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PhoneCall = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Megaphone = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const Plus = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const Play = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const Pause = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const History = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 6v6l4 2"/></svg>;
const Download = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const X = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const Calendar = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const Trash = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const Edit = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const FileAudio = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11.5"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M6 16h2"/></svg>;
const Server = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>;
const Globe = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const Phone = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

type View = 'dashboard' | 'agents' | 'campaigns' | 'settings' | 'playground' | 'calls';

interface SipTestModalData {
    type: 'agent' | 'campaign';
    id: string;
    name: string;
    agentId: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]); 
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSipTesting, setIsSipTesting] = useState(false);

  // Modals & Selection
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // Test Modal States
  const [showWebTestModal, setShowWebTestModal] = useState(false); // Used in Campaign Creation
  const [webTestCampaign, setWebTestCampaign] = useState<Campaign | null>(null); // Used in Campaigns List
  const [sipTestModalData, setSipTestModalData] = useState<SipTestModalData | null>(null);
  const [sipTestNumber, setSipTestNumber] = useState('');
  
  // Campaign Creation Test States
  const [sipTestPhone, setSipTestPhone] = useState('');
  const [showSipTestInput, setShowSipTestInput] = useState(false);
  
  // Delete States
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // SIP Form State
  const [sipForm, setSipForm] = useState<SipConfig>({
      providerName: '', host: '', port: 5060, username: '', password: '', enabled: false, status: 'Disconnected'
  });

  const apiKey = process.env.API_KEY || '';

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ags, cmps, logs, keys, sip] = await Promise.all([
                api.getAgents(),
                api.getCampaigns(),
                api.getCallLogs(),
                api.getApiKeys(),
                api.getSipConfig()
            ]);
            setAgents(ags);
            setCampaigns(cmps);
            setCallLogs(logs);
            setApiKeys(keys);
            setSipConfig(sip);
            setSipForm(sip);
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleTestAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setCurrentView('playground');
  };

  const handleSessionComplete = async (log: CallLog) => {
    const savedLog = await api.saveCallLog(log);
    setCallLogs(prev => [savedLog, ...prev]);
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
    setAgentToDelete(id);
  };

  const confirmDeleteAgent = async () => {
    if (agentToDelete) {
      await api.deleteAgent(agentToDelete);
      setAgents(prev => prev.filter(a => a.id !== agentToDelete));
      if (activeAgent?.id === agentToDelete) {
        setActiveAgent(null);
        if (currentView === 'playground') {
            setCurrentView('agents');
        }
      }
      setAgentToDelete(null);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaignToDelete(id);
  };

  const confirmDeleteCampaign = async () => {
    if (campaignToDelete) {
      await api.deleteCampaign(campaignToDelete);
      setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete));
      setCampaignToDelete(null);
    }
  };

  // --- Campaign Start/Stop (SIP Integration) ---
  const handleToggleCampaign = async (id: string, currentStatus: string) => {
     const action = currentStatus === 'Running' ? 'pause' : 'start';
     const updated = await api.toggleCampaign(id, action);
     
     // Update UI state
     setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
     
     // Show SIP toast simulation
     if (action === 'start') {
        if (sipConfig?.enabled && sipConfig?.status === 'Connected') {
            alert(`SIP Dialing Initiated via ${sipConfig.providerName}\n\nCalling leads from list...`);
        } else if (sipConfig?.enabled) {
            alert(`Checking SIP connection to ${sipConfig.host}...\nStarting Dialer...`);
        } else {
             // Fallback or just standard simulation
        }
     }
  };

  const handleSaveAgent = async () => {
    if (editingAgent) {
      const savedAgent = await api.saveAgent(editingAgent);
      setAgents(prev => {
        const exists = prev.some(a => a.id === savedAgent.id);
        if (exists) return prev.map(a => a.id === savedAgent.id ? savedAgent : a);
        return [...prev, savedAgent];
      });
      setShowAgentModal(false);
      setEditingAgent(null);
    }
  };

  // SIP Actions
  const handleSaveSip = async () => {
     setIsSipTesting(true);
     await api.saveSipConfig(sipForm);
     setSipConfig(sipForm);
     setIsSipTesting(false);
     alert("SIP Configuration Saved");
  };

  const handleTestSip = async () => {
      setIsSipTesting(true);
      const success = await api.testSipConnection();
      setIsSipTesting(false);
      setSipConfig(prev => prev ? { ...prev, status: success ? 'Connected' : 'Error' } : null);
      setSipForm(prev => ({ ...prev, status: success ? 'Connected' : 'Error' }));
      if (success) alert("SIP Connection Successful!");
      else alert("SIP Connection Failed. Check credentials.");
  };

  const handleSipTestClick = (type: 'agent' | 'campaign', item: Agent | Campaign) => {
      if (!sipConfig?.enabled) {
          alert("SIP Trunking is disabled. Please enable it in Settings.");
          return;
      }
      setSipTestModalData({
          type,
          id: item.id,
          name: item.name,
          agentId: type === 'agent' ? item.id : (item as Campaign).agentId
      });
      setSipTestNumber('');
  };

  const handleSipDial = async () => {
      if (!sipTestModalData || !sipTestNumber) return;
      setIsSipTesting(true);
      try {
          const res = await api.triggerSipTestCall(
              sipTestNumber, 
              sipTestModalData.name, 
              sipTestModalData.agentId
          );
          alert(res.message);
          setSipTestModalData(null);
      } catch (e) {
          alert("SIP Test Failed");
      } finally {
          setIsSipTesting(false);
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

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaignId(campaign.id);
    setNewCampaign({
      name: campaign.name,
      frequency: campaign.frequency || 'daily',
      scheduleTime: campaign.scheduleTime || '10:00',
      startDate: campaign.startDate || '',
      agentId: campaign.agentId,
      file: null, // Keep file null, we'll use contactCount to show existing data
      contactCount: campaign.totalLeads,
      agentPromptOverride: campaign.agentPromptOverride || ''
    });
    setPreviewContacts(campaign.contactList || []);
    setCampaignStep('form');
    setShowCampaignModal(true);
  };

  const handleCreateCampaign = () => {
    setEditingCampaignId(null);
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
    setPreviewContacts([]);
    setCampaignStep('form');
    setShowCampaignModal(true);
  };

  const handleCampaignNext = () => {
    if (!newCampaign.name || !newCampaign.agentId || !newCampaign.startDate) {
      alert("Please fill all required fields (Name, Agent, Start Date).");
      return;
    }
    // For edit mode, we might not need a file if contacts already exist
    if (!newCampaign.file && newCampaign.contactCount === 0) {
       alert("Please upload a user list.");
       return;
    }

    if (!newCampaign.agentPromptOverride.trim()) {
      alert("Please provide an override prompt for the campaign agent.");
      return;
    }
    setCampaignStep('summary');
  };

  const handleSipTestDial = async () => {
      if (!sipTestPhone.trim()) return;
      setIsSipTesting(true);
      try {
          const res = await api.triggerSipTestCall(sipTestPhone, newCampaign.name, newCampaign.agentId);
          alert(res.message);
      } catch (e) {
          alert("Test failed");
      } finally {
          setIsSipTesting(false);
      }
  };

  const handleSaveCampaign = async () => {
    const campaignData: Campaign = {
      id: editingCampaignId || `cmp_${Math.random().toString(36).substr(2, 5)}`,
      name: newCampaign.name,
      agentId: newCampaign.agentId,
      status: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId)?.status || 'Scheduled' : 'Scheduled',
      progress: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId)?.progress || 0 : 0,
      totalLeads: newCampaign.contactCount,
      connected: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId)?.connected || 0 : 0,
      frequency: newCampaign.frequency,
      scheduleTime: newCampaign.scheduleTime,
      startDate: newCampaign.startDate,
      agentPromptOverride: newCampaign.agentPromptOverride,
      contactList: previewContacts
    };

    if (editingCampaignId) {
      const updated = await api.updateCampaign(campaignData);
      setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
    } else {
      const saved = await api.saveCampaign(campaignData);
      setCampaigns(prev => [saved, ...prev]);
    }

    setShowCampaignModal(false);
    setEditingCampaignId(null);
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
    a.download = `recording-${call.id}.webm`;
    a.click();
  };

  // --- Render Functions ---

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

      {/* SIP Trunk Status Widget */}
      {sipConfig?.enabled && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${sipConfig.status === 'Connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <Server />
                  </div>
                  <div>
                      <h3 className="font-semibold text-gray-900">SIP Trunk: {sipConfig.providerName || "Unknown Provider"}</h3>
                      <p className="text-sm text-gray-500">{sipConfig.host}:{sipConfig.port} • {sipConfig.username}</p>
                  </div>
              </div>
              <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sipConfig.status === 'Connected' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <span className={`h-2 w-2 rounded-full mr-2 ${sipConfig.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {sipConfig.status}
                  </div>
              </div>
          </div>
      )}

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

  const renderSettings = () => (
     <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
        {/* SIP Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Server />
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <Server /> Telephony & SIP Trunking
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                 <input 
                   type="text" 
                   value={sipForm.providerName}
                   onChange={e => setSipForm({...sipForm, providerName: e.target.value})}
                   placeholder="e.g. Twilio Elastic SIP, SignalWire, Asterisk"
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">SIP Domain / Host IP</label>
                 <input 
                   type="text" 
                   value={sipForm.host}
                   onChange={e => setSipForm({...sipForm, host: e.target.value})}
                   placeholder="sip.provider.com"
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none font-mono text-sm"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                 <input 
                   type="number" 
                   value={sipForm.port}
                   onChange={e => setSipForm({...sipForm, port: parseInt(e.target.value)})}
                   placeholder="5060"
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none font-mono text-sm"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Username / Extension</label>
                 <input 
                   type="text" 
                   value={sipForm.username}
                   onChange={e => setSipForm({...sipForm, username: e.target.value})}
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none font-mono text-sm"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Password / Secret</label>
                 <input 
                   type="password" 
                   value={sipForm.password}
                   onChange={e => setSipForm({...sipForm, password: e.target.value})}
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none font-mono text-sm"
                 />
              </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-gray-100">
               <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="enableSip"
                    checked={sipForm.enabled}
                    onChange={e => setSipForm({...sipForm, enabled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="enableSip" className="text-sm font-medium text-gray-700">Enable SIP Trunking for Outbound Campaigns</label>
               </div>
               <div className="flex gap-3">
                  <button 
                     onClick={handleTestSip}
                     disabled={isSipTesting}
                     className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                     {isSipTesting ? (
                       <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                        <PhoneCall className="w-4 h-4" /> 
                     )}
                     Test Connection
                  </button>
                  <button 
                     onClick={handleSaveSip}
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-sm transition"
                  >
                     Save Configuration
                  </button>
               </div>
           </div>
        </div>

        {/* API Keys */}
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
           {/* Show existing count if editing and no new file selected */}
           {!newCampaign.file && newCampaign.contactCount > 0 && (
             <p className="text-xs text-blue-600 mt-1">Using existing list ({newCampaign.contactCount} contacts). Upload new file to replace.</p>
           )}
           {newCampaign.file && newCampaign.contactCount > 0 && (
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
            
            {/* SIP Info in Summary */}
            {sipConfig?.enabled && (
               <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                  <p className="text-gray-500 flex items-center gap-2">
                     <Server className="w-3 h-3" /> Dialing via SIP
                  </p>
                  <p className="font-medium text-gray-900">{sipConfig.providerName} ({sipConfig.host})</p>
               </div>
            )}
         </div>

         {/* Test Campaign Section */}
         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               Test Campaign Configuration
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                   onClick={() => setShowWebTestModal(true)}
                   className="flex-1 py-2 px-3 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                   <Globe className="w-4 h-4" /> Web Test (Browser)
                </button>
                <div className="flex-1 flex gap-2">
                   {!showSipTestInput ? (
                       <button 
                         onClick={() => setShowSipTestInput(true)}
                         disabled={!sipConfig?.enabled}
                         className="w-full py-2 px-3 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400"
                       >
                          <Phone className="w-4 h-4" /> SIP Test Call
                       </button>
                   ) : (
                       <div className="flex w-full gap-2 animate-in fade-in duration-200">
                          <input 
                            type="text" 
                            value={sipTestPhone}
                            onChange={e => setSipTestPhone(e.target.value)}
                            placeholder="+123..."
                            className="flex-1 min-w-0 border border-blue-300 rounded px-2 py-1 text-sm outline-none"
                          />
                          <button 
                            onClick={handleSipTestDial}
                            disabled={isSipTesting}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                             {isSipTesting ? '...' : 'Dial'}
                          </button>
                       </div>
                   )}
                </div>
            </div>
            {!sipConfig?.enabled && (
                <p className="text-[10px] text-gray-500 mt-2 italic">* SIP Testing requires SIP Trunking to be enabled in settings.</p>
            )}
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
                    {previewContacts.length > 0 ? previewContacts.map((c, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-3 py-2 text-gray-900">{c.name}</td>
                        <td className="px-3 py-2 text-gray-500">{c.phone}</td>
                      </tr>
                    )) : (
                        <tr className="bg-white">
                            <td colSpan={2} className="px-3 py-4 text-center text-gray-400 italic">No contacts loaded.</td>
                        </tr>
                    )}
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
          {isLoading && (
              <div className="flex h-full items-center justify-center text-gray-400">
                  Loading system data...
              </div>
          )}

          {!isLoading && currentView === 'dashboard' && renderDashboard()}

          {!isLoading && currentView === 'agents' && (
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
                 <div key={agent.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition group shadow-sm flex flex-col h-full">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${agent.type === 'Inbound' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                           <Users />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditAgent(agent); }} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200" title="Edit Agent">
                             <Edit />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation(); 
                              handleDeleteAgent(agent.id); 
                            }} 
                            className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition border border-gray-200" 
                            title="Delete Agent"
                          >
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
                    </div>
                    {/* Actions Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                      <button 
                        onClick={() => handleTestAgent(agent)}
                        className="flex-1 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Globe className="w-4 h-4" /> Web Test
                      </button>
                      <button 
                         onClick={() => handleSipTestClick('agent', agent)}
                         className="flex-1 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Phone className="w-4 h-4" /> SIP Test
                      </button>
                    </div>
                 </div>
               ))}
               </div>
            </div>
          )}

          {!isLoading && currentView === 'playground' && activeAgent && (
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

          {!isLoading && currentView === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
                <button 
                  onClick={handleCreateCampaign}
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
                      <th className="px-6 py-4 text-right">Actions</th>
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {/* New Test Buttons */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setWebTestCampaign(cmp); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                                title="Web Browser Test"
                            >
                                <Globe className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSipTestClick('campaign', cmp); }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition border border-transparent hover:border-gray-200"
                                title="SIP Dial Test"
                            >
                                <Phone className="w-4 h-4" />
                            </button>
                            
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            {/* Edit Button */}
                             <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCampaign(cmp);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                              title="Edit Campaign"
                            >
                               <Edit />
                            </button>

                            {/* Toggle Start/Pause */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCampaign(cmp.id, cmp.status);
                              }}
                              className={`p-2 rounded-lg transition border border-gray-200 ${
                                cmp.status === 'Running' 
                                  ? 'text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100' 
                                  : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                              }`}
                              title={cmp.status === 'Running' ? "Pause Campaign" : "Start Campaign"}
                            >
                               {cmp.status === 'Running' ? <Pause /> : <Play />}
                            </button>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCampaign(cmp.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition border border-gray-200"
                                title="Delete Campaign"
                            >
                                <Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && currentView === 'calls' && (
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

          {!isLoading && currentView === 'settings' && renderSettings()}
        </div>
      </main>

      {/* --- Modals --- */}
      
      {/* Web Test Modal (Campaign Creation Flow) */}
      {showWebTestModal && (
         <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative flex flex-col">
                <div className="absolute top-4 right-4 z-10">
                   <button onClick={() => setShowWebTestModal(false)} className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200">
                      <X />
                   </button>
                </div>
                <div className="flex-1">
                   {/* We re-use VoiceAgent but passed with the Campaign Override Settings */}
                   <VoiceAgent 
                      apiKey={apiKey}
                      agentName={`${newCampaign.name} (Test)`}
                      // Use the selected Agent's initial message
                      initialMessage={agents.find(a => a.id === newCampaign.agentId)?.initialMessage}
                      // STRICTLY use the Campaign Override Prompt as the system instruction
                      systemInstruction={newCampaign.agentPromptOverride}
                      onClose={() => setShowWebTestModal(false)}
                   />
                </div>
            </div>
         </div>
      )}

      {/* Web Test Modal (Campaigns List View) */}
      {webTestCampaign && (
         <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative flex flex-col">
                <div className="absolute top-4 right-4 z-10">
                   <button onClick={() => setWebTestCampaign(null)} className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200">
                      <X />
                   </button>
                </div>
                <div className="flex-1">
                   <VoiceAgent 
                      apiKey={apiKey}
                      agentName={`${webTestCampaign.name} (Test)`}
                      initialMessage={agents.find(a => a.id === webTestCampaign.agentId)?.initialMessage}
                      systemInstruction={webTestCampaign.agentPromptOverride || agents.find(a => a.id === webTestCampaign.agentId)?.systemInstruction}
                      onClose={() => setWebTestCampaign(null)}
                      onSessionComplete={handleSessionComplete}
                   />
                </div>
            </div>
         </div>
      )}

      {/* SIP Test Modal (Generic for Agent or Campaign) */}
      {sipTestModalData && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6">
              <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">SIP Test Call</h3>
                    <p className="text-sm text-gray-500">Testing {sipTestModalData.type}: {sipTestModalData.name}</p>
                  </div>
                  <button onClick={() => setSipTestModalData(null)} className="text-gray-400 hover:text-gray-700"><X /></button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter Phone Number</label>
                      <input 
                         type="tel"
                         value={sipTestNumber}
                         onChange={e => setSipTestNumber(e.target.value)}
                         placeholder="+1 (555) 000-0000"
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                         autoFocus
                      />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                      Calling via: <strong>{sipConfig?.providerName}</strong><br/>
                      Host: {sipConfig?.host}
                  </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                 <button 
                   onClick={() => setSipTestModalData(null)} 
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSipDial} 
                   disabled={isSipTesting || !sipTestNumber}
                   className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSipTesting ? 'Dialing...' : (
                       <><Phone className="w-4 h-4" /> Dial Now</>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Agent Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Agent?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this agent? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setAgentToDelete(null)} 
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmDeleteAgent} 
                   className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium shadow-sm transition"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Campaign Delete Confirmation Modal */}
      {campaignToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Campaign?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this campaign? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setCampaignToDelete(null)} 
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmDeleteCampaign} 
                   className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium shadow-sm transition"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Call Details Modal (with Playback) */}
      {selectedCall && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <div>
                 <h3 className="text-lg font-bold text-gray-900">Call Details</h3>
                 <p className="text-sm text-gray-500">{selectedCall.agentName} • {selectedCall.timestamp}</p>
              </div>
              <button onClick={() => setSelectedCall(null)} className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"><X /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
               {/* Metadata Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                     <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${selectedCall.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {selectedCall.status}
                     </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                     <p className="text-sm font-medium text-gray-900 mt-1">{selectedCall.duration}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <div className="flex justify-between items-center mb-1">
                       <p className="text-xs text-gray-500 uppercase font-semibold">Sentiment Analysis</p>
                       <span className={`text-xs px-2 py-0.5 rounded font-medium ${selectedCall.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : selectedCall.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                         {selectedCall.sentiment}
                       </span>
                     </div>
                     <p className="text-sm text-gray-700 italic">"{selectedCall.sentimentReason}"</p>
                  </div>
               </div>
               
               {/* Audio Player */}
               {selectedCall.recordingUrl ? (
                 <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                       <FileAudio className="w-4 h-4" /> Call Recording
                    </h4>
                    <audio controls className="w-full h-8 mb-2">
                       <source src={selectedCall.recordingUrl} type="audio/webm" />
                       Your browser does not support the audio element.
                    </audio>
                    <div className="flex justify-end">
                       <button 
                         onClick={() => downloadRecording(selectedCall)}
                         className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                       >
                         <Download className="w-3 h-3" /> Download Audio
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-sm text-gray-500 italic">
                    No audio recording available for this call.
                 </div>
               )}

               {/* Transcript */}
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="text-sm font-semibold text-gray-900">Transcript</h4>
                     <button 
                       onClick={() => downloadTranscript(selectedCall)}
                       className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
                     >
                       <Download className="w-3 h-3" /> Download Text
                     </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-60 overflow-y-auto space-y-3 text-sm">
                     {selectedCall.transcript.length === 0 ? (
                        <p className="text-gray-400 italic text-center">No transcript generated.</p>
                     ) : (
                        selectedCall.transcript.map((msg, idx) => (
                           <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                 msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                              }`}>
                                 <p>{msg.text}</p>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
               <button 
                 onClick={() => setSelectedCall(null)}
                 className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
      
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
                       <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
                       <select 
                         value={editingAgent.type}
                         onChange={e => setEditingAgent({...editingAgent, type: e.target.value as any})}
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                       >
                         <option value="Inbound">Inbound</option>
                         <option value="Outbound">Outbound</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                       <select 
                         value={editingAgent.status}
                         onChange={e => setEditingAgent({...editingAgent, status: e.target.value as any})}
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                       >
                         <option value="Active">Active</option>
                         <option value="Inactive">Inactive</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                       <select 
                         value={editingAgent.voice}
                         onChange={e => setEditingAgent({...editingAgent, voice: e.target.value})}
                         className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                       >
                         <option value="Kore">Kore</option>
                         <option value="Puck">Puck</option>
                         <option value="Fenrir">Fenrir</option>
                         <option value="Charon">Charon</option>
                         <option value="Zephyr">Zephyr</option>
                       </select>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Greeting</label>
                    <input 
                      type="text"
                      value={editingAgent.initialMessage || ''}
                      onChange={e => setEditingAgent({...editingAgent, initialMessage: e.target.value})}
                      placeholder="e.g. Hello, thanks for calling Kredmint..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Instructions</label>
                    <textarea 
                      value={editingAgent.systemInstruction}
                      onChange={e => setEditingAgent({...editingAgent, systemInstruction: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none h-32 font-mono text-sm resize-none"
                      placeholder="Define the agent's persona and knowledge base..."
                    />
                 </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                 <button 
                   onClick={() => setShowAgentModal(false)}
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSaveAgent}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-sm transition"
                 >
                   Save Agent
                 </button>
              </div>
            </div>
         </div>
      )}

      {/* Campaign Create Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-900">
                    {editingCampaignId 
                       ? 'Edit Campaign' 
                       : (campaignStep === 'form' ? 'Create New Campaign' : 'Review Campaign')
                    }
                 </h3>
                 <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-gray-700"><X /></button>
              </div>
              
              {campaignStep === 'form' ? renderCampaignForm() : renderCampaignSummary()}
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                 {campaignStep === 'summary' && (
                   <button 
                     onClick={() => setCampaignStep('form')}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                   >
                     Back
                   </button>
                 )}
                 <button 
                   onClick={() => setShowCampaignModal(false)}
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                 >
                   Cancel
                 </button>
                 {campaignStep === 'form' ? (
                    <button 
                      onClick={handleCampaignNext}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-sm transition flex items-center gap-2"
                    >
                      Next <ArrowRight />
                    </button>
                 ) : (
                    <button 
                      onClick={handleSaveCampaign}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-sm transition flex items-center gap-2"
                    >
                      <Megaphone className="w-4 h-4" /> {editingCampaignId ? 'Update Campaign' : 'Launch Campaign'}
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
