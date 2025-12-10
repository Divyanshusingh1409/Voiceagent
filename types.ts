
export interface Inquiry {
  id: string;
  customerName: string;
  mobile: string;
  product: string;
  timestamp: Date;
  status: 'logged';
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

export const PRODUCTS = [
  { name: 'Distribution / Retailer Finance', code: 'DRF' },
  { name: 'Invoice Discounting (ID)', code: 'ID' },
  { name: 'Pre-Invoice Discounting (PID)', code: 'PID' },
  { name: 'Supplier Invoice Discounting (SID)', code: 'SID' },
  { name: 'Term Loans', code: 'TL' },
];

export interface Agent {
  id: string;
  name: string;
  type: 'Inbound' | 'Outbound';
  status: 'Active' | 'Inactive';
  voice: string;
  systemInstruction: string;
  initialMessage?: string; // New field for the first message
}

export interface Contact {
  name: string;
  phone: string;
  [key: string]: any;
}

export interface Campaign {
  id: string;
  name: string;
  agentId: string;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Paused';
  progress: number;
  totalLeads: number;
  connected: number;
  // New Configuration Fields
  frequency?: 'daily' | 'weekly';
  scheduleTime?: string;
  startDate?: string;
  contactList?: Contact[];
  agentPromptOverride?: string; // New field for campaign-specific instruction
}

export interface CallLog {
  id: string;
  agentName: string;
  duration: string;
  durationSeconds: number;
  status: 'Completed' | 'Failed' | 'Missed';
  timestamp: string;
  date: Date;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentReason?: string; // New field for backend analysis
  transcript: ChatMessage[];
  recordingUrl?: string; // Blob URL
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Masked in UI
  created: string;
  lastUsed: string;
}