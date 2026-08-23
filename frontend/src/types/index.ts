export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface ExtractedPart {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost?: number;
}

export interface ExtractedFinancials {
  quotedAmount: number;
  laborCost?: number;
  partsCost?: number;
  isPaid: boolean;
  paymentMethod: string;
}

export interface ExtractedActionItem {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeRole: string;
}

export interface ExtractedData {
  id?: string;
  executiveSummary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  confidenceScore: number;
  customerInfo?: {
    name?: string;
    companyName?: string;
    phone?: string;
    address?: string;
  };
  jobDetails?: {
    title?: string;
    category?: string;
    laborHours?: number;
  };
  partsAndServices: ExtractedPart[];
  financials?: ExtractedFinancials;
  actionItems: ExtractedActionItem[];
}

export interface Recording {
  id: string;
  workspaceId: string;
  customerId?: string;
  jobId?: string;
  audioUrl: string;
  audioDurationSec: number;
  audioFormat: string;
  fileSizeBytes: number;
  status: 'PENDING' | 'UPLOADING' | 'TRANSCRIBING' | 'EXTRACTING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  rawTranscript?: string;
  wordTimestamps: WordTimestamp[];
  extractedData?: ExtractedData;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
    phone?: string;
    address?: string;
  };
  job?: {
    id: string;
    title: string;
    status: string;
    quotedAmount?: number;
  };
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  tags: string[];
  _count?: {
    recordings: number;
    jobs: number;
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  workspaceId: string;
  customerId: string;
  title: string;
  description?: string;
  category?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  quotedAmount?: number;
  laborHours?: number;
  scheduledAt?: string;
  completedAt?: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
  };
  tasks?: Task[];
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  customerId?: string;
  jobId?: string;
  recordingId?: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assigneeRole?: string;
  customer?: {
    id: string;
    name: string;
  };
  job?: {
    id: string;
    title: string;
  };
}

export interface DashboardStats {
  totalVoiceHours: number;
  totalRecordings: number;
  totalCustomers: number;
  totalJobs: number;
  completedJobs: number;
  pendingTasks: number;
  recentRecordings: Recording[];
}
