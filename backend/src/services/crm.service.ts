import { prisma } from '../database/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { JobStatus, Priority, TaskStatus, ProcessingStatus } from '@prisma/client';

export class CRMService {
  // ==================== CUSTOMERS ====================

  static async listCustomers(
    workspaceId: string,
    params: { search?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { companyName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              jobs: true,
              recordings: true,
              tasks: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createCustomer(
    workspaceId: string,
    data: {
      name: string;
      companyName?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      notes?: string;
      tags?: string[];
    }
  ) {
    return await prisma.customer.create({
      data: {
        workspaceId,
        ...data,
      },
    });
  }

  static async getCustomerById(workspaceId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, workspaceId },
      include: {
        jobs: { orderBy: { createdAt: 'desc' } },
        recordings: {
          include: { extractedData: true },
          orderBy: { recordedAt: 'desc' },
        },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found.', 404);
    }

    return customer;
  }

  static async getCustomerTimeline(workspaceId: string, customerId: string) {
    const customer = await this.getCustomerById(workspaceId, customerId);

    const timelineItems: Array<{
      id: string;
      type: 'RECORDING' | 'JOB' | 'TASK' | 'ACTIVITY';
      timestamp: Date;
      title: string;
      description?: string | null;
      meta?: any;
    }> = [];

    // Add recordings
    for (const rec of customer.recordings) {
      timelineItems.push({
        id: rec.id,
        type: 'RECORDING',
        timestamp: rec.recordedAt,
        title: 'Voice Note Debrief',
        description: rec.extractedData?.executiveSummary || rec.rawTranscript?.slice(0, 120),
        meta: {
          status: rec.status,
          durationSec: rec.audioDurationSec,
          extracted: rec.extractedData,
        },
      });
    }

    // Add jobs
    for (const job of customer.jobs) {
      timelineItems.push({
        id: job.id,
        type: 'JOB',
        timestamp: job.createdAt,
        title: `Job: ${job.title}`,
        description: job.description,
        meta: {
          status: job.status,
          quotedAmount: job.quotedAmount,
          category: job.category,
        },
      });
    }

    // Add tasks
    for (const task of customer.tasks) {
      timelineItems.push({
        id: task.id,
        type: 'TASK',
        timestamp: task.createdAt,
        title: `Task: ${task.title}`,
        description: task.description,
        meta: {
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        },
      });
    }

    // Sort chronologically descending
    timelineItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      timeline: timelineItems,
    };
  }

  // ==================== JOBS ====================

  static async listJobs(
    workspaceId: string,
    params: {
      status?: JobStatus;
      priority?: Priority;
      customerId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.customerId) where.customerId = params.customerId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { customer: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: {
          customer: true,
          _count: {
            select: { tasks: true, recordings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createJob(
    workspaceId: string,
    data: {
      customerId: string;
      title: string;
      description?: string;
      category?: string;
      status?: JobStatus;
      priority?: Priority;
      quotedAmount?: number;
      laborHours?: number;
      scheduledAt?: Date;
    }
  ) {
    return await prisma.job.create({
      data: {
        workspaceId,
        ...data,
      },
      include: { customer: true },
    });
  }

  static async getJobById(workspaceId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, workspaceId },
      include: {
        customer: true,
        recordings: { include: { extractedData: true } },
        tasks: true,
      },
    });

    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    return job;
  }

  static async updateJob(
    workspaceId: string,
    jobId: string,
    data: {
      title?: string;
      description?: string;
      status?: JobStatus;
      priority?: Priority;
      quotedAmount?: number;
      laborHours?: number;
      scheduledAt?: Date;
      completedAt?: Date;
    }
  ) {
    return await prisma.job.update({
      where: { id: jobId },
      data,
      include: { customer: true },
    });
  }

  // ==================== TASKS ====================

  static async listTasks(
    workspaceId: string,
    params: {
      status?: TaskStatus;
      priority?: Priority;
      assignedToId?: string;
      customerId?: string;
      jobId?: string;
    } = {}
  ) {
    const where: any = { workspaceId };
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.customerId) where.customerId = params.customerId;
    if (params.jobId) where.jobId = params.jobId;

    return await prisma.task.findMany({
      where,
      include: {
        customer: true,
        job: true,
        assignedTo: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async createTask(
    workspaceId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: Priority;
      dueDate?: Date;
      customerId?: string;
      jobId?: string;
      assignedToId?: string;
    }
  ) {
    return await prisma.task.create({
      data: {
        workspaceId,
        createdById: userId,
        ...data,
      },
      include: { customer: true, job: true },
    });
  }

  static async updateTask(
    workspaceId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      dueDate?: Date | null;
      assignedToId?: string | null;
    }
  ) {
    return await prisma.task.update({
      where: { id: taskId },
      data,
      include: { customer: true, job: true, assignedTo: true },
    });
  }

  static async toggleTaskStatus(workspaceId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, workspaceId },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;

    return await prisma.task.update({
      where: { id: taskId },
      data: { status: nextStatus },
      include: { customer: true, job: true },
    });
  }

  // ==================== STATS & DASHBOARD ====================

  static async getWorkspaceStats(workspaceId: string) {
    const [
      totalRecordings,
      recordings,
      totalCustomers,
      totalJobs,
      completedJobs,
      pendingTasks,
      recentRecordings,
    ] = await Promise.all([
      prisma.recording.count({ where: { workspaceId } }),
      prisma.recording.findMany({
        where: { workspaceId, status: 'COMPLETED' },
        select: { audioDurationSec: true },
      }),
      prisma.customer.count({ where: { workspaceId } }),
      prisma.job.count({ where: { workspaceId } }),
      prisma.job.count({ where: { workspaceId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { workspaceId, status: 'TODO' } }),
      prisma.recording.findMany({
        where: { workspaceId },
        include: {
          customer: true,
          job: true,
          extractedData: true,
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { recordedAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalSecondsLogged = recordings.reduce((sum, r) => sum + (r.audioDurationSec || 0), 0);
    const totalVoiceHours = parseFloat((totalSecondsLogged / 3600).toFixed(2));

    return {
      totalVoiceHours,
      totalRecordings,
      totalCustomers,
      totalJobs,
      completedJobs,
      pendingTasks,
      recentRecordings,
    };
  }

  static async getWorkspaceAnalytics(workspaceId: string) {
    const [jobs, extractedDataList, tasks] = await Promise.all([
      prisma.job.findMany({
        where: { workspaceId },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          quotedAmount: true,
          laborHours: true,
          createdAt: true,
        },
      }),
      prisma.extractedData.findMany({
        where: { recording: { workspaceId } },
        select: {
          financials: true,
          partsAndServices: true,
          jobDetails: true,
          sentiment: true,
          createdAt: true,
        },
      }),
      prisma.task.findMany({
        where: { workspaceId },
        select: { status: true, priority: true },
      }),
    ]);

    // Financial KPIs
    let totalQuotedRevenue = 0;
    let totalLaborHours = 0;
    let laborCount = 0;

    jobs.forEach((job) => {
      if (job.quotedAmount) totalQuotedRevenue += Number(job.quotedAmount);
      if (job.laborHours) {
        totalLaborHours += Number(job.laborHours);
        laborCount++;
      }
    });

    const averageJobValue = jobs.length > 0 ? Math.round(totalQuotedRevenue / jobs.length) : 0;
    const averageLaborHours = laborCount > 0 ? parseFloat((totalLaborHours / laborCount).toFixed(1)) : 0;

    // Task Completion Rate
    const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

    // Trade Category Distribution
    const tradeCounts: Record<string, number> = {
      HVAC: 0,
      Electrical: 0,
      Plumbing: 0,
      Inspection: 0,
      General: 0,
    };

    jobs.forEach((job) => {
      const cat = job.category?.toUpperCase() || 'GENERAL';
      if (cat.includes('HVAC') || cat.includes('AC') || cat.includes('COOL')) tradeCounts.HVAC++;
      else if (cat.includes('ELECTR') || cat.includes('PANEL')) tradeCounts.Electrical++;
      else if (cat.includes('PLUMB') || cat.includes('PIPE') || cat.includes('WATER')) tradeCounts.Plumbing++;
      else if (cat.includes('INSPECT')) tradeCounts.Inspection++;
      else tradeCounts.General++;
    });

    // Top Parts Inventory & Usage
    const partsMap: Record<string, { name: string; quantity: number; totalCost: number }> = {};
    extractedDataList.forEach((item) => {
      const parts = (item.partsAndServices as any[]) || [];
      parts.forEach((p) => {
        const name = p.name || 'Generic Material';
        const qty = Number(p.quantity) || 1;
        const cost = Number(p.totalCost) || (Number(p.unitCost) || 0) * qty;

        if (!partsMap[name]) {
          partsMap[name] = { name, quantity: 0, totalCost: 0 };
        }
        partsMap[name].quantity += qty;
        partsMap[name].totalCost += cost;
      });
    });

    const topParts = Object.values(partsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Revenue History (Past 6 months / weeks mock aggregated)
    const revenueTrends = [
      { period: 'Mon', revenue: Math.round(totalQuotedRevenue * 0.12), jobs: 2 },
      { period: 'Tue', revenue: Math.round(totalQuotedRevenue * 0.18), jobs: 3 },
      { period: 'Wed', revenue: Math.round(totalQuotedRevenue * 0.15), jobs: 2 },
      { period: 'Thu', revenue: Math.round(totalQuotedRevenue * 0.22), jobs: 4 },
      { period: 'Fri', revenue: Math.round(totalQuotedRevenue * 0.25), jobs: 5 },
      { period: 'Sat', revenue: Math.round(totalQuotedRevenue * 0.08), jobs: 1 },
    ];

    return {
      kpis: {
        totalQuotedRevenue,
        averageJobValue,
        averageLaborHours,
        taskCompletionRate,
        activeJobsCount: jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length,
      },
      tradeBreakdown: Object.entries(tradeCounts).map(([name, count]) => ({
        name,
        count,
        percentage: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 20,
      })),
      topParts,
      revenueTrends,
    };
  }

  // ==================== CSV EXPORT ====================

  static async exportJobsCsv(workspaceId: string): Promise<string> {
    const jobs = await prisma.job.findMany({
      where: { workspaceId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Job ID',
      'Title',
      'Category',
      'Status',
      'Priority',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Quoted Amount ($)',
      'Labor Hours',
      'Created Date',
    ];

    const rows = jobs.map((j) => [
      `"${j.id}"`,
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${(j.category || 'General').replace(/"/g, '""')}"`,
      `"${j.status}"`,
      `"${j.priority}"`,
      `"${(j.customer?.name || '').replace(/"/g, '""')}"`,
      `"${(j.customer?.email || '').replace(/"/g, '""')}"`,
      `"${(j.customer?.phone || '').replace(/"/g, '""')}"`,
      j.quotedAmount ? Number(j.quotedAmount).toFixed(2) : '0.00',
      j.laborHours ? Number(j.laborHours).toFixed(1) : '0.0',
      `"${j.createdAt.toISOString()}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static async exportRecordingsCsv(workspaceId: string): Promise<string> {
    const recordings = await prisma.recording.findMany({
      where: { workspaceId },
      include: { customer: true, extractedData: true },
      orderBy: { recordedAt: 'desc' },
    });

    const headers = [
      'Recording ID',
      'Recorded At',
      'Status',
      'Duration (sec)',
      'Customer Name',
      'Executive Summary',
      'Confidence Score (%)',
      'Quoted Amount ($)',
    ];

    const rows = recordings.map((r) => {
      const ext = r.extractedData;
      const fin = ext?.financials as any;
      const custInfo = ext?.customerInfo as any;
      return [
        `"${r.id}"`,
        `"${r.recordedAt.toISOString()}"`,
        `"${r.status}"`,
        r.audioDurationSec ? r.audioDurationSec.toFixed(1) : '0.0',
        `"${(r.customer?.name || custInfo?.name || '').replace(/"/g, '""')}"`,
        `"${(ext?.executiveSummary || '').replace(/"/g, '""')}"`,
        ext?.confidenceScore ? (ext.confidenceScore * 100).toFixed(0) : '0',
        fin?.quotedAmount ? Number(fin.quotedAmount).toFixed(2) : '0.00',
      ];
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static async getNotificationsFeed(workspaceId: string) {
    const [recentLogs, recentRecordings, pendingTasks] = await Promise.all([
      prisma.activityLog.findMany({
        where: { user: { memberships: { some: { workspaceId } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { fullName: true } } },
      }),
      prisma.recording.findMany({
        where: { workspaceId, status: ProcessingStatus.COMPLETED },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { customer: true, extractedData: true },
      }),
      prisma.task.findMany({
        where: { workspaceId, status: TaskStatus.TODO },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: { customer: true },
      }),
    ]);

    const notifications: Array<{
      id: string;
      type: 'AI_PROCESSED' | 'INVOICE_SENT' | 'SIGNATURE_CAPTURED' | 'TASK_REMINDER' | 'ACTIVITY';
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      link?: string;
    }> = [];

    // Map recent recordings
    for (const rec of recentRecordings) {
      const custName = rec.customer?.name || (rec.extractedData as any)?.customerInfo?.name || 'Customer';
      notifications.push({
        id: `notif-rec-${rec.id}`,
        type: 'AI_PROCESSED',
        title: 'Voice Debrief Processed',
        message: `AI extracted CRM entities and action items for ${custName} (${rec.audioDurationSec.toFixed(0)}s audio).`,
        timestamp: rec.updatedAt.toISOString(),
        read: false,
        link: `/studio?id=${rec.id}`,
      });
    }

    // Map activity logs
    for (const log of recentLogs) {
      if (log.action === 'SIGNATURE_CAPTURED') {
        const meta = log.metadata as any;
        notifications.push({
          id: `notif-log-${log.id}`,
          type: 'SIGNATURE_CAPTURED',
          title: 'Digital Signature Captured',
          message: `${meta?.signerName || 'Customer'} signed work order authorization.`,
          timestamp: log.createdAt.toISOString(),
          read: true,
        });
      } else if (log.action === 'INVOICE_SENT_TO_CUSTOMER') {
        const meta = log.metadata as any;
        notifications.push({
          id: `notif-log-${log.id}`,
          type: 'INVOICE_SENT',
          title: 'Invoice Dispatched',
          message: `Invoice sent to customer via ${meta?.deliveryMethod || 'Email'}.`,
          timestamp: log.createdAt.toISOString(),
          read: true,
        });
      }
    }

    // Map urgent tasks
    for (const task of pendingTasks) {
      notifications.push({
        id: `notif-task-${task.id}`,
        type: 'TASK_REMINDER',
        title: 'Action Item Due',
        message: `${task.title} for ${task.customer?.name || 'Client'}.`,
        timestamp: task.createdAt.toISOString(),
        read: false,
        link: '/kanban',
      });
    }

    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  }
}
