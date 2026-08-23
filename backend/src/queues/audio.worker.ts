import { Worker, Job } from 'bullmq';
import { redisConnectionConfig, checkRedisHealth } from './redis.connection.js';
import { AUDIO_QUEUE_NAME } from './audio.queue.js';
import { AudioProcessingJobData } from '../types/index.js';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { sttService } from '../services/stt.service.js';
import { llmService } from '../services/llm.service.js';
import { EntityUpsertService } from '../services/entity-upsert.service.js';
import { webhookService } from '../services/webhook.service.js';
import { socketServer } from '../socket/socket.server.js';
import { ProcessingStatus } from '@prisma/client';

export async function processAudioJob(data: AudioProcessingJobData): Promise<any> {
  const { recordingId, workspaceId, userId, audioUrl, audioKey, audioFormat, durationSec, customerOverrideId, promptAdjustment } = data;

  logger.info(`Starting audio & AI processing pipeline for recording ${recordingId}`);

  try {
    // 0. Fetch workspace for industry vocabulary boost
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    const industry = workspace?.industry || undefined;

    // 1. Stage 1: STT Transcription
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: ProcessingStatus.TRANSCRIBING },
    });

    socketServer.emitStatusChange({
      workspaceId,
      recordingId,
      status: ProcessingStatus.TRANSCRIBING,
      progressPercent: 25,
      message: 'Transcribing speech with custom industry vocabulary...',
    });

    const transcription = await sttService.transcribe({
      audioUrl,
      audioKey,
      audioFormat,
      durationSec,
      industry,
    });

    // Save transcription to database
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        rawTranscript: transcription.transcript,
        wordTimestamps: transcription.wordTimestamps as any,
        audioDurationSec: transcription.durationSec || durationSec || 45.0,
      },
    });

    // 2. Stage 2: LLM Structured Entity Extraction
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: ProcessingStatus.EXTRACTING },
    });

    socketServer.emitStatusChange({
      workspaceId,
      recordingId,
      status: ProcessingStatus.EXTRACTING,
      progressPercent: 65,
      message: 'Extracting customers, parts, costs, and scheduling action items...',
    });

    const extraction = await llmService.extractEntities(transcription.transcript, {
      industry,
      promptAdjustment,
    });

    // 3. Stage 3: PostgreSQL CRM Upsert (Customer, Job, ExtractedData, Tasks, ActivityLog)
    const result = await EntityUpsertService.processAndUpsert({
      recordingId,
      workspaceId,
      userId,
      extraction,
      customerOverrideId,
    });

    // 4. Stage 4: Mark Complete
    const finalizedRecording = await prisma.recording.update({
      where: { id: recordingId },
      data: {
        status: ProcessingStatus.COMPLETED,
        errorMessage: null,
      },
      include: {
        customer: true,
        job: true,
        extractedData: true,
        tasks: true,
      },
    });

    socketServer.emitRecordingCompleted({
      workspaceId,
      recordingId,
      data: finalizedRecording,
    });

    // 5. Dispatch Outbound Webhook to subscribed endpoints (Zapier, QuickBooks, ServiceTitan)
    webhookService.dispatch(workspaceId, 'recording.completed', {
      recordingId: finalizedRecording.id,
      audioDurationSec: finalizedRecording.audioDurationSec,
      transcript: finalizedRecording.rawTranscript,
      extractedData: finalizedRecording.extractedData,
      customer: finalizedRecording.customer,
      job: finalizedRecording.job,
      tasks: finalizedRecording.tasks,
      completedAt: new Date().toISOString(),
    });

    if (finalizedRecording.customerId) {
      socketServer.emitCustomerActivity({
        workspaceId,
        customerId: finalizedRecording.customerId,
        action: 'VOICE_NOTE_ADDED',
        summary: extraction.summary,
      });
    }

    logger.info(`Successfully completed AI audio pipeline for recording ${recordingId}`);
    return finalizedRecording;
  } catch (error: any) {
    logger.error(`Audio pipeline failed for recording ${recordingId}:`, error);

    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        status: ProcessingStatus.FAILED,
        errorMessage: error.message || 'Processing failed',
      },
    });

    socketServer.emitRecordingFailed({
      workspaceId,
      recordingId,
      errorMessage: error.message || 'Processing failed',
    });

    throw error;
  }
}

export async function startAudioWorker(): Promise<Worker<AudioProcessingJobData> | null> {
  try {
    const isHealthy = await checkRedisHealth();
    if (!isHealthy) {
      return null;
    }

    const worker = new Worker<AudioProcessingJobData>(
      AUDIO_QUEUE_NAME,
      async (job: Job<AudioProcessingJobData>) => {
        logger.info(`Worker consuming job ${job.id} for recording ${job.data.recordingId}`);
        return await processAudioJob(job.data);
      },
      {
        connection: redisConnectionConfig,
        concurrency: 5,
      }
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} for recording ${job.data.recordingId} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    logger.info('BullMQ Audio Worker initialized and listening');
    return worker;
  } catch (error) {
    logger.warn('Could not start standalone BullMQ worker. Pipeline will run in-process.');
    return null;
  }
}
