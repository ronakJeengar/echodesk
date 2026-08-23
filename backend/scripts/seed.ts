import bcrypt from 'bcryptjs';
import { PrismaClient, GlobalRole, WorkspaceRole, ProcessingStatus, Sentiment, JobStatus, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EchoDesk database seed...');

  // 1. Clean existing records
  await prisma.activityLog.deleteMany();
  await prisma.extractedData.deleteMany();
  await prisma.task.deleteMany();
  await prisma.job.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // 2. Create Field Technician & Admin Users
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);

  const dave = await prisma.user.create({
    data: {
      fullName: 'Dave Miller',
      email: 'dave@prohvac.com',
      password: passwordHash,
      phone: '555-0142',
      role: GlobalRole.USER,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    },
  });

  const sarahAdmin = await prisma.user.create({
    data: {
      fullName: 'Sarah Connor',
      email: 'sarah@prohvac.com',
      password: passwordHash,
      phone: '555-0143',
      role: GlobalRole.USER,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    },
  });

  console.log('Created users: Dave Miller, Sarah Connor.');

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Pro HVAC Solutions',
      slug: 'pro-hvac-solutions',
      industry: 'HVAC',
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: dave.id, role: WorkspaceRole.OWNER },
      { workspaceId: workspace.id, userId: sarahAdmin.id, role: WorkspaceRole.ADMIN },
    ],
  });

  console.log(`Created workspace: ${workspace.name} (${workspace.slug})`);

  // 4. Create Customers
  const customerApex = await prisma.customer.create({
    data: {
      workspaceId: workspace.id,
      name: 'Sarah Jenkins',
      companyName: 'Apex Logistics',
      email: 'sjenkins@apexlogistics.com',
      phone: '555-0199',
      address: '452 Industrial Parkway, Suite B',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      notes: 'Key client for quarterly HVAC service contract.',
      tags: ['Commercial', 'High Priority', 'HVAC'],
    },
  });

  const customerMark = await prisma.customer.create({
    data: {
      workspaceId: workspace.id,
      name: 'Mark Henderson',
      email: 'mhenderson@gmail.com',
      phone: '555-0288',
      address: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      postalCode: '78704',
      notes: 'Residential customer.',
      tags: ['Residential', 'Water Heater'],
    },
  });

  console.log('Created customers: Sarah Jenkins (Apex Logistics), Mark Henderson.');

  // 5. Create Job for Sarah Jenkins
  const jobApex = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      customerId: customerApex.id,
      title: 'HVAC Emergency Diagnostic & Capacitor Replacement',
      category: 'HVAC',
      description: 'Outdoor AC condenser unit humming but not spinning. Replaced dual run capacitor and verified refrigerant pressures.',
      status: JobStatus.COMPLETED,
      priority: Priority.HIGH,
      quotedAmount: 285.0,
      laborHours: 1.5,
      completedAt: new Date(),
    },
  });

  // 6. Create Recording with STT word timestamps & Extracted Data
  const wordTimestamps = [
    { word: 'Just', start: 0.12, end: 0.35, confidence: 0.99 },
    { word: 'wrapped', start: 0.36, end: 0.65, confidence: 0.98 },
    { word: 'up', start: 0.66, end: 0.82, confidence: 0.99 },
    { word: 'at', start: 0.83, end: 0.95, confidence: 0.99 },
    { word: 'Sarah', start: 0.96, end: 1.25, confidence: 0.97 },
    { word: "Jenkins'", start: 1.26, end: 1.62, confidence: 0.98 },
    { word: 'office', start: 1.63, end: 1.95, confidence: 0.99 },
    { word: 'at', start: 1.96, end: 2.05, confidence: 0.99 },
    { word: 'Apex', start: 2.06, end: 2.38, confidence: 0.98 },
    { word: 'Logistics.', start: 2.39, end: 2.85, confidence: 0.99 },
    { word: 'Outdoor', start: 2.95, end: 3.32, confidence: 0.98 },
    { word: 'condenser', start: 3.33, end: 3.75, confidence: 0.99 },
    { word: 'unit', start: 3.76, end: 3.98, confidence: 0.99 },
    { word: 'was', start: 3.99, end: 4.12, confidence: 0.99 },
    { word: 'humming', start: 4.13, end: 4.45, confidence: 0.97 },
    { word: 'but', start: 4.46, end: 4.60, confidence: 0.99 },
    { word: 'not', start: 4.61, end: 4.75, confidence: 0.99 },
    { word: 'spinning.', start: 4.76, end: 5.20, confidence: 0.99 },
    { word: 'Replaced', start: 5.30, end: 5.68, confidence: 0.98 },
    { word: '45/5', start: 5.69, end: 6.10, confidence: 0.96 },
    { word: 'MFD', start: 6.11, end: 6.45, confidence: 0.97 },
    { word: 'dual', start: 6.46, end: 6.70, confidence: 0.98 },
    { word: 'run', start: 6.71, end: 6.90, confidence: 0.99 },
    { word: 'capacitor.', start: 6.91, end: 7.45, confidence: 0.99 },
    { word: 'Total', start: 7.55, end: 7.85, confidence: 0.99 },
    { word: 'bill', start: 7.86, end: 8.05, confidence: 0.99 },
    { word: 'is', start: 8.06, end: 8.18, confidence: 0.99 },
    { word: '$285.', start: 8.19, end: 8.70, confidence: 0.99 },
  ];

  const recording = await prisma.recording.create({
    data: {
      id: 'rec-apex-4092',
      workspaceId: workspace.id,
      createdById: dave.id,
      customerId: customerApex.id,
      jobId: jobApex.id,
      audioUrl: `audio/${workspace.id}/rec-apex-4092.m4a`,
      audioDurationSec: 48.5,
      audioFormat: 'm4a',
      fileSizeBytes: 1048576,
      status: ProcessingStatus.COMPLETED,
      rawTranscript:
        "Just wrapped up at Sarah Jenkins' office at Apex Logistics. Outdoor condenser unit was humming but not spinning. Replaced 45/5 MFD dual run capacitor. Tested R-410A refrigerant pressure. System blowing cold at 54 degrees. Total bill is $285 including $42 for the capacitor and 1.5 hours of labor. Please send invoice #4092 to Sarah Jenkins by Friday.",
      wordTimestamps: wordTimestamps as any,
    },
  });

  await prisma.extractedData.create({
    data: {
      recordingId: recording.id,
      executiveSummary: 'Replaced faulty 45/5 MFD capacitor on outdoor AC condenser unit and verified operating pressures at Sarah Jenkins property.',
      sentiment: Sentiment.POSITIVE,
      confidenceScore: 0.98,
      customerInfo: {
        name: 'Sarah Jenkins',
        companyName: 'Apex Logistics',
        phone: '555-0199',
        address: '452 Industrial Parkway, Suite B',
      },
      jobDetails: {
        title: 'HVAC Emergency Diagnostic & Capacitor Replacement',
        category: 'HVAC',
        status: 'COMPLETED',
        laborHours: 1.5,
      },
      partsAndServices: [
        { name: '45/5 MFD 440V Dual Round Run Capacitor', quantity: 1, unitCost: 42.0, totalCost: 42.0 },
      ],
      financials: {
        quotedAmount: 285.0,
        laborCost: 150.0,
        partsCost: 42.0,
        isPaid: false,
        paymentMethod: 'INVOICE_PENDING',
      },
      actionItems: [
        {
          title: 'Send invoice #4092 to Sarah Jenkins',
          description: 'Deliver finalized invoice for $285.00',
          dueDate: '2026-08-25T17:00:00Z',
          priority: 'HIGH',
          assigneeRole: 'ADMIN',
        },
        {
          title: 'Schedule 6-month seasonal tune-up inspection',
          description: 'Check operating pressures and system performance.',
          dueDate: '2027-02-15T09:00:00Z',
          priority: 'MEDIUM',
          assigneeRole: 'FIELD_TECH',
        },
      ],
      llmModelUsed: 'gpt-4o',
      rawPromptTokens: 380,
      completionTokens: 210,
    },
  });

  // 7. Create Action Item Tasks
  await prisma.task.createMany({
    data: [
      {
        workspaceId: workspace.id,
        createdById: dave.id,
        assignedToId: sarahAdmin.id,
        customerId: customerApex.id,
        jobId: jobApex.id,
        recordingId: recording.id,
        title: 'Send invoice #4092 to Sarah Jenkins',
        description: 'Deliver finalized invoice for $285.00',
        priority: Priority.HIGH,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: workspace.id,
        createdById: dave.id,
        assignedToId: dave.id,
        customerId: customerApex.id,
        jobId: jobApex.id,
        recordingId: recording.id,
        title: 'Schedule 6-month seasonal tune-up inspection',
        description: 'Check operating pressures and system performance in Spring.',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 8. Log Activity
  await prisma.activityLog.create({
    data: {
      userId: dave.id,
      recordingId: recording.id,
      action: 'RECORDING_PROCESSED',
      metadata: {
        customer: 'Sarah Jenkins',
        company: 'Apex Logistics',
        quotedAmount: 285.0,
        jobId: jobApex.id,
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`
--------------------------------------------------
🔑 Demo Credentials:
Email:    dave@prohvac.com
Password: SecurePassword123!
Workspace: Pro HVAC Solutions (HVAC)
--------------------------------------------------
`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
