import { Request } from 'express';
import { GlobalRole, WorkspaceRole, ProcessingStatus, Sentiment, JobStatus, Priority, TaskStatus } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  globalRole: GlobalRole;
  currentWorkspaceId?: string;
  currentWorkspaceRole?: WorkspaceRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  role: GlobalRole;
  workspaceId?: string;
  workspaceRole?: WorkspaceRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  workspaceId?: string;
  workspaceRole?: WorkspaceRole;
}

// ==================== AI EXTRACTION SCHEMAS ====================

export interface ExtractedCustomer {
  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface ExtractedJob {
  title: string;
  category?: string;
  description?: string;
  status?: JobStatus;
  priority?: Priority;
  laborHours?: number;
}

export interface ExtractedPartOrService {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost?: number;
}

export interface ExtractedFinancials {
  quotedAmount?: number;
  laborCost?: number;
  partsCost?: number;
  isPaid?: boolean;
  paymentMethod?: string;
}

export interface ExtractedActionItem {
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601
  priority?: Priority;
  assigneeRole?: 'FIELD_TECH' | 'ADMIN' | 'MANAGER' | 'OWNER';
}

export interface StructuredExtractionResult {
  summary: string;
  customer?: ExtractedCustomer;
  job?: ExtractedJob;
  partsAndServices?: ExtractedPartOrService[];
  financials?: ExtractedFinancials;
  actionItems?: ExtractedActionItem[];
  sentiment: Sentiment;
  confidenceScore: number;
  rawPromptTokens?: number;
  completionTokens?: number;
  llmModelUsed?: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionResult {
  transcript: string;
  wordTimestamps: WordTimestamp[];
  durationSec: number;
  language?: string;
}

// ==================== WORKER JOBS ====================

export interface AudioProcessingJobData {
  recordingId: string;
  workspaceId: string;
  userId: string;
  audioUrl: string;
  audioKey: string;
  audioFormat: string;
  fileSizeBytes: number;
  durationSec?: number;
  customerOverrideId?: string;
  jobCategoryOverride?: string;
  promptAdjustment?: string;
  retryCount?: number;
}

// ==================== API RESPONSE HELPERS ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
