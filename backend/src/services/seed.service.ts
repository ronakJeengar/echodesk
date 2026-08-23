import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { JobStatus, Priority, TaskStatus, ProcessingStatus } from '@prisma/client';

export class SeedService {
  static async seedWorkspace(workspaceId: string, userId: string) {
    logger.info(`Seeding demo field operations data for workspace: ${workspaceId}`);

    // 1. Customer: Sarah Jenkins (Apex Logistics) - HVAC
    const cust1 = await prisma.customer.create({
      data: {
        workspaceId,
        name: 'Sarah Jenkins',
        companyName: 'Apex Logistics',
        email: 'sarah.jenkins@apexlogistics.com',
        phone: '(555) 019-2834',
        address: '400 Industrial Parkway, Suite 100',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        notes: 'Commercial logistics facility. Gate access code #4092.',
        tags: ['Commercial', 'HVAC Service Agreement'],
      },
    });

    const job1 = await prisma.job.create({
      data: {
        workspaceId,
        customerId: cust1.id,
        title: 'Emergency AC Diagnostic & Dual Run Capacitor Replacement',
        category: 'HVAC',
        status: JobStatus.COMPLETED,
        priority: Priority.HIGH,
        quotedAmount: 285.0,
        laborHours: 1.5,
        scheduledAt: new Date(Date.now() - 2 * 86400000),
        completedAt: new Date(Date.now() - 2 * 86400000 + 7200000),
      },
    });

    const rec1 = await prisma.recording.create({
      data: {
        id: `rec-demo-hvac-${Date.now().toString(36)}`,
        workspaceId,
        createdById: userId,
        customerId: cust1.id,
        jobId: job1.id,
        audioUrl: 'https://cdn.freesound.org/previews/518/518305_10825313-lq.mp3',
        audioDurationSec: 42.0,
        audioFormat: 'm4a',
        fileSizeBytes: 890120,
        status: ProcessingStatus.COMPLETED,
        rawTranscript:
          "Just wrapped up the diagnostic at Sarah Jenkins' office over at Apex Logistics. The outdoor AC condenser unit was humming but not spinning. Tested the 45/5 MFD dual run capacitor and it was completely blown. Swapped it out with a fresh 45/5 MFD capacitor and tested the R-410A refrigerant pressure. System is blowing cold at 54 degrees now. Total bill is $285 including $42 for the capacitor and 1.5 hours of labor. Please send invoice #4092 to Sarah Jenkins by Friday, and schedule a 6-month seasonal tune-up for February.",
        wordTimestamps: [],
      },
    });

    await prisma.extractedData.create({
      data: {
        recordingId: rec1.id,
        executiveSummary:
          'Outdoor AC condenser fan motor failed to start due to blown 45/5 MFD dual run capacitor. Replaced capacitor, verified R-410A system pressure, and confirmed 54°F supply air temperature.',
        sentiment: 'POSITIVE',
        confidenceScore: 0.98,
        customerInfo: {
          name: 'Sarah Jenkins',
          companyName: 'Apex Logistics',
          email: 'sarah.jenkins@apexlogistics.com',
          phone: '(555) 019-2834',
          address: '400 Industrial Parkway, Suite 100',
        },
        jobDetails: {
          title: 'Emergency AC Diagnostic & Dual Run Capacitor Replacement',
          category: 'HVAC',
          laborHours: 1.5,
        },
        partsAndServices: [
          { name: '45/5 MFD Dual Round Capacitor', quantity: 1, unitCost: 42.0, totalCost: 42.0 },
          { name: 'HVAC Diagnostic Service Call', quantity: 1, unitCost: 95.0, totalCost: 95.0 },
          { name: 'Field Technician Labor (1.5 hrs)', quantity: 1.5, unitCost: 98.0, totalCost: 148.0 },
        ],
        financials: {
          quotedAmount: 285.0,
          partsCost: 42.0,
          laborCost: 243.0,
          isPaid: true,
          paymentMethod: 'CREDIT_CARD',
        },
        actionItems: [
          {
            title: 'Send Invoice #4092 to Sarah Jenkins',
            description: 'Email PDF work order invoice to accounting before Friday',
            dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
            priority: 'HIGH',
            assigneeRole: 'BILLING',
          },
          {
            title: 'Schedule 6-Month Seasonal Tune-Up',
            description: 'Book follow-up preventive maintenance check',
            dueDate: new Date(Date.now() + 180 * 86400000).toISOString(),
            priority: 'MEDIUM',
            assigneeRole: 'DISPATCHER',
          },
        ],
      },
    });

    await prisma.task.createMany({
      data: [
        {
          workspaceId,
          createdById: userId,
          customerId: cust1.id,
          jobId: job1.id,
          recordingId: rec1.id,
          title: 'Send Invoice #4092 to Sarah Jenkins',
          description: 'Email PDF work order invoice to accounting before Friday',
          priority: Priority.HIGH,
          status: TaskStatus.DONE,
          dueDate: new Date(Date.now() + 2 * 86400000),
        },
        {
          workspaceId,
          createdById: userId,
          customerId: cust1.id,
          jobId: job1.id,
          recordingId: rec1.id,
          title: 'Schedule 6-Month Seasonal Tune-Up',
          description: 'Book follow-up preventive maintenance check in February',
          priority: Priority.MEDIUM,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() + 180 * 86400000),
        },
      ],
    });

    // 2. Customer: David Ramirez - Electrical
    const cust2 = await prisma.customer.create({
      data: {
        workspaceId,
        name: 'David Ramirez',
        email: 'david.ramirez88@gmail.com',
        phone: '(555) 438-9921',
        address: '1204 Oak Ridge Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78704',
        tags: ['Residential', 'Electrical Upgrade'],
      },
    });

    const job2 = await prisma.job.create({
      data: {
        workspaceId,
        customerId: cust2.id,
        title: '200-Amp Main Service Panel Upgrade & GFCI Retrofit',
        category: 'Electrical',
        status: JobStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        quotedAmount: 1450.0,
        laborHours: 4.0,
        scheduledAt: new Date(),
      },
    });

    const rec2 = await prisma.recording.create({
      data: {
        id: `rec-demo-elec-${Date.now().toString(36)}`,
        workspaceId,
        createdById: userId,
        customerId: cust2.id,
        jobId: job2.id,
        audioUrl: 'https://cdn.freesound.org/previews/518/518305_10825313-lq.mp3',
        audioDurationSec: 36.5,
        audioFormat: 'm4a',
        fileSizeBytes: 760400,
        status: ProcessingStatus.COMPLETED,
        rawTranscript:
          'Completed inspection for David Ramirez at 1204 Oak Ridge Way. Upgraded the main subpanel to a 200 amp Square D breaker panel. Replaced two ungrounded kitchen outlets with 20-amp GFCI receptacles. Total quoted amount was $1,450. Tech labor was 4 hours. Remind tech to pull the final county electrical permit inspection by next Monday.',
        wordTimestamps: [],
      },
    });

    await prisma.extractedData.create({
      data: {
        recordingId: rec2.id,
        executiveSummary:
          'Upgraded residential subpanel to 200A Square D breaker panel and retrofitted two ungrounded kitchen branch circuits with 20A tamper-resistant GFCI outlets.',
        sentiment: 'POSITIVE',
        confidenceScore: 0.96,
        customerInfo: {
          name: 'David Ramirez',
          email: 'david.ramirez88@gmail.com',
          phone: '(555) 438-9921',
          address: '1204 Oak Ridge Way',
        },
        jobDetails: {
          title: '200-Amp Main Service Panel Upgrade & GFCI Retrofit',
          category: 'Electrical',
          laborHours: 4.0,
        },
        partsAndServices: [
          { name: 'Square D 200A Main Breaker Panel', quantity: 1, unitCost: 480.0, totalCost: 480.0 },
          { name: '20A Commercial GFCI Receptacle', quantity: 2, unitCost: 28.0, totalCost: 56.0 },
          { name: 'Master Electrician Labor (4.0 hrs)', quantity: 4, unitCost: 228.5, totalCost: 914.0 },
        ],
        financials: {
          quotedAmount: 1450.0,
          partsCost: 536.0,
          laborCost: 914.0,
          isPaid: false,
          paymentMethod: 'INVOICE_PENDING',
        },
        actionItems: [
          {
            title: 'Schedule County Electrical Permit Inspection',
            description: 'Submit final inspection request to Travis County development office',
            dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
            priority: 'HIGH',
            assigneeRole: 'PERMITS',
          },
        ],
      },
    });

    await prisma.task.create({
      data: {
        workspaceId,
        createdById: userId,
        customerId: cust2.id,
        jobId: job2.id,
        recordingId: rec2.id,
        title: 'Schedule County Electrical Permit Inspection',
        description: 'Submit final inspection request to county building office by next Monday',
        priority: Priority.HIGH,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 4 * 86400000),
      },
    });

    // 3. Customer: Mark Henderson - Plumbing
    const cust3 = await prisma.customer.create({
      data: {
        workspaceId,
        name: 'Mark Henderson',
        email: 'm.henderson@outlook.com',
        phone: '(555) 771-8204',
        address: '742 Evergreen Terrace',
        city: 'Austin',
        state: 'TX',
        postalCode: '78745',
        tags: ['Residential', 'Plumbing'],
      },
    });

    const job3 = await prisma.job.create({
      data: {
        workspaceId,
        customerId: cust3.id,
        title: 'High-Pressure PRV Valve & Water Heater Expansion Tank Installation',
        category: 'Plumbing',
        status: JobStatus.SCHEDULED,
        priority: Priority.MEDIUM,
        quotedAmount: 650.0,
        laborHours: 2.5,
        scheduledAt: new Date(Date.now() + 86400000),
      },
    });

    const rec3 = await prisma.recording.create({
      data: {
        id: `rec-demo-plumb-${Date.now().toString(36)}`,
        workspaceId,
        createdById: userId,
        customerId: cust3.id,
        jobId: job3.id,
        audioUrl: 'https://cdn.freesound.org/previews/518/518305_10825313-lq.mp3',
        audioDurationSec: 31.0,
        audioFormat: 'm4a',
        fileSizeBytes: 650000,
        status: ProcessingStatus.COMPLETED,
        rawTranscript:
          'Finished service call for Mark Henderson at 742 Evergreen Terrace. Main water pressure was spiking at 95 PSI. Replaced the faulty pressure reducing valve with a new 3/4 inch lead-free PRV valve and installed an expansion tank on the 50-gallon Rheem water heater. Quoted total was $650. Need to follow up next Tuesday to verify the pressure gauge holds at 60 PSI.',
        wordTimestamps: [],
      },
    });

    await prisma.extractedData.create({
      data: {
        recordingId: rec3.id,
        executiveSummary:
          'Resolved dangerous 95 PSI water hammer pressure spike by replacing failed pressure reducing valve with 3/4" lead-free PRV and installing thermal expansion tank.',
        sentiment: 'POSITIVE',
        confidenceScore: 0.97,
        customerInfo: {
          name: 'Mark Henderson',
          email: 'm.henderson@outlook.com',
          phone: '(555) 771-8204',
          address: '742 Evergreen Terrace',
        },
        jobDetails: {
          title: 'High-Pressure PRV Valve & Water Heater Expansion Tank Installation',
          category: 'Plumbing',
          laborHours: 2.5,
        },
        partsAndServices: [
          { name: '3/4" Lead-Free PRV Pressure Reducing Valve', quantity: 1, unitCost: 165.0, totalCost: 165.0 },
          { name: '2-Gallon Thermal Expansion Tank', quantity: 1, unitCost: 85.0, totalCost: 85.0 },
          { name: 'Journeyman Plumber Labor (2.5 hrs)', quantity: 2.5, unitCost: 160.0, totalCost: 400.0 },
        ],
        financials: {
          quotedAmount: 650.0,
          partsCost: 250.0,
          laborCost: 400.0,
          isPaid: false,
          paymentMethod: 'INVOICE_PENDING',
        },
        actionItems: [
          {
            title: 'Verify Water Pressure Gauge at 60 PSI',
            description: 'Follow-up pressure check on next Tuesday morning',
            dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
            priority: 'MEDIUM',
            assigneeRole: 'FIELD_TECH',
          },
        ],
      },
    });

    await prisma.task.create({
      data: {
        workspaceId,
        createdById: userId,
        customerId: cust3.id,
        jobId: job3.id,
        recordingId: rec3.id,
        title: 'Verify Water Pressure Gauge at 60 PSI',
        description: 'Follow-up check to confirm PRV holds at 60 PSI',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
    });

    return {
      success: true,
      message: 'Demo field records (HVAC, Electrical, Plumbing) seeded successfully!',
      seeded: {
        customers: [cust1.name, cust2.name, cust3.name],
        jobsCount: 3,
        recordingsCount: 3,
      },
    };
  }
}
