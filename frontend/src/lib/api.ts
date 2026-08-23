import axios from 'axios';
import { DashboardStats, Recording, Customer, Job, Task } from '../types';

export interface WebhookSubscription {
  id: string;
  workspaceId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject stored JWT token and workspace ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('echodesk_token');
  const workspaceId = localStorage.getItem('echodesk_workspace_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (workspaceId) {
    config.headers['x-workspace-id'] = workspaceId;
  }
  return config;
});

// Default seed login helper if no token exists
export async function ensureAuthenticated() {
  const existingToken = localStorage.getItem('echodesk_token');
  if (existingToken) return existingToken;

  try {
    const res = await axios.post('/api/v1/auth/login', {
      email: 'dave@prohvac.com',
      password: 'SecurePassword123!',
    });

    if (res.data?.data?.accessToken) {
      const { accessToken, workspace } = res.data.data;
      localStorage.setItem('echodesk_token', accessToken);
      if (workspace?.id) {
        localStorage.setItem('echodesk_workspace_id', workspace.id);
      }
      return accessToken;
    }
  } catch (err) {
    console.warn('Auto-login error:', err);
  }
  return null;
}

export const fetchStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/stats');
  return res.data.data;
};

export const fetchRecordings = async (): Promise<Recording[]> => {
  const res = await api.get('/recordings');
  return res.data.data.recordings;
};

export const fetchRecordingById = async (id: string): Promise<Recording> => {
  const res = await api.get(`/recordings/${id}`);
  return res.data.data;
};

export const fetchCustomers = async (search?: string): Promise<Customer[]> => {
  const res = await api.get('/customers', { params: { search } });
  return res.data.data.customers;
};

export const createCustomer = async (data: {
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  tags?: string[];
}): Promise<Customer> => {
  const res = await api.post('/customers', data);
  return res.data.data;
};

export const fetchCustomerTimeline = async (customerId: string) => {
  const res = await api.get(`/customers/${customerId}/timeline`);
  return res.data.data;
};

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await api.get('/jobs');
  return res.data.data.jobs;
};

export const createJob = async (data: {
  customerId: string;
  title: string;
  description?: string;
  category?: string;
  laborHours?: number;
  quotedAmount?: number;
  priority?: string;
  status?: string;
}): Promise<Job> => {
  const res = await api.post('/jobs', data);
  return res.data.data;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get('/tasks');
  return res.data.data;
};

export const toggleTask = async (taskId: string): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/toggle`);
  return res.data.data;
};

export const reExtractRecording = async (id: string, promptAdjustment: string): Promise<Recording> => {
  const res = await api.post(`/recordings/${id}/re-extract`, { promptAdjustment });
  return res.data.data;
};

export const requestPresignedUrl = async (params: {
  durationSec: number;
  fileSizeBytes: number;
  audioFormat: string;
}) => {
  const workspaceId = localStorage.getItem('echodesk_workspace_id');
  const res = await api.post('/recordings/presigned-url', {
    ...params,
    workspaceId,
  });
  return res.data.data;
};

export const processRecording = async (recordingId: string, params?: { jobCategory?: string; customerId?: string }) => {
  const res = await api.post(`/recordings/${recordingId}/process`, params || {});
  return res.data.data;
};

// Webhook APIs
export const fetchWebhooks = async (): Promise<WebhookSubscription[]> => {
  const res = await api.get('/workspaces/webhooks');
  return res.data.data.webhooks;
};

export const createWebhook = async (data: {
  url: string;
  events: string[];
}): Promise<WebhookSubscription> => {
  const res = await api.post('/workspaces/webhooks', data);
  return res.data.data.webhook;
};

export const deleteWebhook = async (id: string): Promise<void> => {
  await api.delete(`/workspaces/webhooks/${id}`);
};

export const testPingWebhook = async (params: {
  url: string;
  secret?: string;
}): Promise<{ success: boolean; statusCode: number; message: string }> => {
  const res = await api.post('/workspaces/webhooks/test-ping', params);
  return res.data.data;
};

export const sendInvoiceToCustomer = async (
  recordingId: string,
  params: {
    recipientEmail?: string;
    recipientPhone?: string;
    deliveryMethod: 'EMAIL' | 'SMS' | 'BOTH';
  }
): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/recordings/${recordingId}/send-invoice`, params);
  return res.data;
};

export const fetchAnalytics = async (): Promise<{
  kpis: {
    totalQuotedRevenue: number;
    averageJobValue: number;
    averageLaborHours: number;
    taskCompletionRate: number;
    activeJobsCount: number;
  };
  tradeBreakdown: Array<{ name: string; count: number; percentage: number }>;
  topParts: Array<{ name: string; quantity: number; totalCost: number }>;
  revenueTrends: Array<{ period: string; revenue: number; jobs: number }>;
}> => {
  const res = await api.get('/stats/analytics');
  return res.data.data;
};

export const seedDemoData = async (): Promise<{
  success: boolean;
  message: string;
  seeded: { customers: string[]; jobsCount: number; recordingsCount: number };
}> => {
  const res = await api.post('/workspaces/seed-demo');
  return res.data;
};

export interface AppNotification {
  id: string;
  type: 'AI_PROCESSED' | 'INVOICE_SENT' | 'SIGNATURE_CAPTURED' | 'TASK_REMINDER' | 'ACTIVITY';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const fetchNotifications = async (): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> => {
  const res = await api.get('/stats/notifications');
  return res.data.data;
};
