import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { StructuredExtractionResult } from '../types/index.js';
import { Priority, TaskStatus, JobStatus, Prisma } from '@prisma/client';

export interface EntityUpsertParams {
  recordingId: string;
  workspaceId: string;
  userId: string;
  extraction: StructuredExtractionResult;
  customerOverrideId?: string;
}

export class EntityUpsertService {
  static async processAndUpsert(params: EntityUpsertParams) {
    const { recordingId, workspaceId, userId, extraction, customerOverrideId } = params;

    logger.info(`Persisting AI extraction entities for recording ${recordingId} in workspace ${workspaceId}`);

    return await prisma.$transaction(async (tx) => {
      // 1. Customer Resolution (Find existing or create new)
      let customerId = customerOverrideId;

      if (!customerId && extraction.customer?.name) {
        const orConditions: Prisma.CustomerWhereInput[] = [
          { name: { equals: extraction.customer.name, mode: Prisma.QueryMode.insensitive } },
        ];

        if (extraction.customer.phone) {
          orConditions.push({ phone: extraction.customer.phone });
        }
        if (extraction.customer.companyName) {
          orConditions.push({
            companyName: { equals: extraction.customer.companyName, mode: Prisma.QueryMode.insensitive },
          });
        }

        const existingCustomer = await tx.customer.findFirst({
          where: {
            workspaceId,
            OR: orConditions,
          },
        });

        if (existingCustomer) {
          customerId = existingCustomer.id;
          if (!existingCustomer.address && extraction.customer.address) {
            await tx.customer.update({
              where: { id: existingCustomer.id },
              data: { address: extraction.customer.address },
            });
          }
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              workspaceId,
              name: extraction.customer.name,
              companyName: extraction.customer.companyName,
              phone: extraction.customer.phone,
              email: extraction.customer.email,
              address: extraction.customer.address,
              city: extraction.customer.city,
              state: extraction.customer.state,
              postalCode: extraction.customer.postalCode,
              notes: `Auto-created from Voice Recording ${recordingId}`,
            },
          });
          customerId = newCustomer.id;
          logger.info(`Created new customer: ${newCustomer.name} (${newCustomer.id})`);
        }
      }

      // 2. Job Creation / Linking
      let jobId: string | null = null;
      if (customerId && extraction.job) {
        const job = await tx.job.create({
          data: {
            workspaceId,
            customerId,
            title: extraction.job.title || 'Field Service Visit',
            category: extraction.job.category || 'General Service',
            description: extraction.job.description || extraction.summary,
            status: extraction.job.status || JobStatus.COMPLETED,
            priority: extraction.job.priority || Priority.MEDIUM,
            quotedAmount: extraction.financials?.quotedAmount,
            laborHours: extraction.job.laborHours,
            completedAt: extraction.job.status === JobStatus.COMPLETED ? new Date() : null,
          },
        });
        jobId = job.id;
        logger.info(`Created job record: ${job.title} (${job.id})`);
      }

      // 3. Upsert ExtractedData
      const extractedData = await tx.extractedData.upsert({
        where: { recordingId },
        update: {
          executiveSummary: extraction.summary,
          sentiment: extraction.sentiment,
          confidenceScore: extraction.confidenceScore,
          customerInfo: extraction.customer as any,
          jobDetails: extraction.job as any,
          partsAndServices: extraction.partsAndServices as any,
          financials: extraction.financials as any,
          actionItems: extraction.actionItems as any,
          rawPromptTokens: extraction.rawPromptTokens,
          completionTokens: extraction.completionTokens,
          llmModelUsed: extraction.llmModelUsed,
        },
        create: {
          recordingId,
          executiveSummary: extraction.summary,
          sentiment: extraction.sentiment,
          confidenceScore: extraction.confidenceScore,
          customerInfo: extraction.customer as any,
          jobDetails: extraction.job as any,
          partsAndServices: extraction.partsAndServices as any,
          financials: extraction.financials as any,
          actionItems: extraction.actionItems as any,
          rawPromptTokens: extraction.rawPromptTokens,
          completionTokens: extraction.completionTokens,
          llmModelUsed: extraction.llmModelUsed,
        },
      });

      // 4. Create Scheduled Action Item Tasks
      const createdTasks = [];
      if (extraction.actionItems && extraction.actionItems.length > 0) {
        for (const item of extraction.actionItems) {
          const task = await tx.task.create({
            data: {
              workspaceId,
              createdById: userId,
              customerId,
              jobId,
              recordingId,
              title: item.title,
              description: item.description,
              priority: item.priority || Priority.MEDIUM,
              status: TaskStatus.TODO,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
          createdTasks.push(task);
        }
        logger.info(`Created ${createdTasks.length} follow-up tasks`);
      }

      // 5. Update Recording with linked customer, job, and status
      const updatedRecording = await tx.recording.update({
        where: { id: recordingId },
        data: {
          customerId,
          jobId,
        },
        include: {
          customer: true,
          job: true,
          extractedData: true,
          tasks: true,
        },
      });

      // 6. Log Activity Log
      await tx.activityLog.create({
        data: {
          userId,
          recordingId,
          action: 'RECORDING_PROCESSED',
          metadata: {
            summary: extraction.summary,
            customerId,
            jobId,
            taskCount: createdTasks.length,
            quotedAmount: extraction.financials?.quotedAmount,
          },
        },
      });

      return {
        recording: updatedRecording,
        extractedData,
        tasks: createdTasks,
      };
    });
  }
}
