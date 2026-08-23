export interface PresignedUrlRequest {
  workspaceId: string;
  recordingId: string;
  audioFormat: string;
  fileSizeBytes?: number;
  durationSec?: number;
}

export interface PresignedUrlResponse {
  recordingId: string;
  uploadUrl: string;
  audioKey: string;
  expiresInSec: number;
}

export interface IStorageService {
  generatePresignedUploadUrl(params: PresignedUrlRequest): Promise<PresignedUrlResponse>;
  generatePresignedDownloadUrl(audioKey: string): Promise<string>;
}

export interface TranscriptionResult {
  transcript: string;
  durationSec: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  confidence: number;
  detectedLanguage: string;
}

export interface ISTTService {
  transcribe(audioKey: string, industryHint?: string): Promise<TranscriptionResult>;
}

export interface ExtractedEntitiesResult {
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    companyName?: string;
  };
  jobDetails?: {
    title?: string;
    category?: string;
    status?: string;
    scheduledDate?: string;
  };
  partsAndMaterials?: Array<{
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
  financials?: {
    quotedAmount?: number;
    laborCost?: number;
    materialsCost?: number;
    tax?: number;
    discount?: number;
  };
  actionItems?: Array<{
    task: string;
    assignedTo?: string;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }>;
  executiveSummary?: string;
  tags?: string[];
}

export interface ILLMService {
  extractEntities(transcript: string, industry?: string, promptAdjustment?: string): Promise<ExtractedEntitiesResult>;
}
