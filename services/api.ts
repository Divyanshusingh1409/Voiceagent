
import { Agent, Campaign, CallLog, ApiKey, Contact, SipConfig } from '../types';

// --- Mock Data Storage (Simulating Database) ---
let agents: Agent[] = [
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

let campaigns: Campaign[] = [
  { id: 'cmp_01', name: 'Q1 Retailer Outreach', agentId: 'ag_02', status: 'Running', progress: 45, totalLeads: 2000, connected: 450, frequency: 'weekly', scheduleTime: '09:00', startDate: '2024-03-01', agentPromptOverride: 'You are a lead qualification agent for Kredmint. Ask about turnover and business vintage.', contactList: [] },
  { id: 'cmp_02', name: 'Overdue Reminders', agentId: 'ag_03', status: 'Scheduled', progress: 0, totalLeads: 500, connected: 0, frequency: 'daily', scheduleTime: '14:00', startDate: '2024-03-05', agentPromptOverride: 'You are a payment collection assistant. Be polite but firm about upcoming due dates.', contactList: [] },
  { id: 'cmp_03', name: 'New Product Launch', agentId: 'ag_01', status: 'Completed', progress: 100, totalLeads: 1200, connected: 890, frequency: 'weekly', scheduleTime: '10:00', startDate: '2024-02-15', agentPromptOverride: 'Promote the new Term Loan product.', contactList: [] },
];

let callLogs: CallLog[] = [
  { id: 'call_9821', agentName: 'Kredmint Support', duration: '2m 14s', durationSeconds: 134, status: 'Completed', timestamp: '10:30 AM', date: new Date(Date.now() - 3600000), sentiment: 'Positive', sentimentReason: 'Customer successfully applied for ID.', transcript: [], recordingUrl: '' },
  { id: 'call_9820', agentName: 'Kredmint Support', duration: '45s', durationSeconds: 45, status: 'Failed', timestamp: '9:15 AM', date: new Date(Date.now() - 7200000), sentiment: 'Neutral', sentimentReason: 'Call dropped before product discussion.', transcript: [], recordingUrl: '' },
];

let apiKeys: ApiKey[] = [
  { id: 'key_01', name: 'Production Key', key: 'sk-prod-••••••••', created: '2023-10-01', lastUsed: 'Just now' },
  { id: 'key_02', name: 'Dev Key', key: 'sk-dev-••••••••', created: '2024-01-15', lastUsed: '2 days ago' }
];

let sipConfig: SipConfig = {
  providerName: '',
  host: '',
  port: 5060,
  username: '',
  password: '',
  enabled: false,
  status: 'Disconnected'
};

// --- Helper to simulate network delay ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Methods ---

export const api = {
  // Agents
  getAgents: async (): Promise<Agent[]> => {
    await delay(300);
    return [...agents];
  },
  
  saveAgent: async (agent: Agent): Promise<Agent> => {
    await delay(500);
    const index = agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.push(agent);
    }
    return agent;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await delay(400);
    agents = agents.filter(a => a.id !== id);
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    await delay(300);
    return [...campaigns];
  },

  saveCampaign: async (campaign: Campaign): Promise<Campaign> => {
    await delay(500);
    campaigns = [campaign, ...campaigns];
    return campaign;
  },

  updateCampaign: async (campaign: Campaign): Promise<Campaign> => {
    await delay(500);
    const index = campaigns.findIndex(c => c.id === campaign.id);
    if (index !== -1) {
      campaigns[index] = campaign;
      return campaign;
    }
    throw new Error("Campaign not found");
  },

  toggleCampaign: async (id: string, action: 'start' | 'pause'): Promise<Campaign> => {
    await delay(200);
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
        campaign.status = action === 'start' ? 'Running' : 'Paused';
        
        // --- Backend Integration Logic ---
        // In a real Python/Node backend, this is where you would:
        // 1. Check if sipConfig.enabled is true.
        // 2. Initialize the SIP Dialer (e.g. PJSIP, Asterisk AMI, or Twilio API).
        // 3. Begin the dialing queue for the contacts in this campaign.
        if (action === 'start' && sipConfig.enabled) {
            console.log(`[Backend] Initiating SIP Dialing via ${sipConfig.host}:${sipConfig.port} for Campaign ${campaign.name}`);
        } else if (action === 'start') {
            console.log(`[Backend] Simulating Standard System Dialer for Campaign ${campaign.name}`);
        }
    }
    return campaign!;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await delay(400);
    campaigns = campaigns.filter(c => c.id !== id);
  },

  triggerSipTestCall: async (phone: string, campaignName: string, agentId: string): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    if (!sipConfig.enabled) {
        return { success: false, message: "SIP Trunking is not enabled in settings." };
    }
    if (sipConfig.status !== 'Connected') {
        // For simulation, we might allow it if it's just 'Disconnected' but enabled, 
        // but strictly it should be connected. We'll be lenient for the demo.
        if (!sipConfig.host) return { success: false, message: "Missing SIP Host configuration." };
    }
    
    console.log(`[Backend] Dialing ${phone} via ${sipConfig.host} using Agent ${agentId} for Campaign '${campaignName}'`);
    return { success: true, message: `Test call initiated to ${phone} via ${sipConfig.providerName || 'SIP Trunk'}.` };
  },

  // Call Logs
  getCallLogs: async (): Promise<CallLog[]> => {
    await delay(300);
    return [...callLogs];
  },

  saveCallLog: async (log: CallLog): Promise<CallLog> => {
    await delay(200);
    callLogs = [log, ...callLogs];
    return log;
  },

  // API Keys
  getApiKeys: async (): Promise<ApiKey[]> => {
    await delay(300);
    return [...apiKeys];
  },

  // SIP Configuration
  getSipConfig: async (): Promise<SipConfig> => {
    await delay(300);
    return { ...sipConfig };
  },

  saveSipConfig: async (config: SipConfig): Promise<SipConfig> => {
    await delay(600);
    sipConfig = { ...config, status: 'Disconnected' }; // Reset status on save until tested
    return sipConfig;
  },

  testSipConnection: async (): Promise<boolean> => {
    await delay(2000); // Simulate connection handshake
    if (sipConfig.host && sipConfig.username && sipConfig.password) {
        sipConfig.status = 'Connected';
        return true;
    }
    sipConfig.status = 'Error';
    return false;
  }
};
