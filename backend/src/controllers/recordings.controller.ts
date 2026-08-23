import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../database/prisma.js';
import { storageService } from '../services/storage.service.js';
import { addAudioProcessingJob } from '../queues/audio.queue.js';
import { llmService } from '../services/llm.service.js';
import { EntityUpsertService } from '../services/entity-upsert.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ProcessingStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export const presignedUrlSchema = z.object({
  workspaceId: z.string().optional(),
  fileSizeBytes: z.number().positive().default(1048576),
  audioFormat: z.string().default('m4a'),
  durationSec: z.number().positive().default(45.0),
});

export const processRecordingSchema = z.object({
  customerId: z.string().optional(),
  jobCategory: z.string().optional(),
});

export const reExtractSchema = z.object({
  promptAdjustment: z.string().min(3, 'Please provide correction instructions'),
});

export class RecordingsController {
  static async requestPresignedUrl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = (req.body.workspaceId || req.workspaceId) as string;
      if (!workspaceId) {
        throw new AppError('Workspace context is required', 400);
      }
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { fileSizeBytes, audioFormat, durationSec } = req.body;
      const recordingId = `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      // Generate Presigned URL
      const presigned = await storageService.generatePresignedUploadUrl({
        workspaceId,
        recordingId,
        audioFormat,
        fileSizeBytes,
        durationSec,
      });

      // Create Initial Recording Record
      const recording = await prisma.recording.create({
        data: {
          id: recordingId,
          workspaceId,
          createdById: req.user.id,
          audioUrl: presigned.audioKey,
          audioFormat,
          fileSizeBytes,
          audioDurationSec: durationSec,
          status: ProcessingStatus.UPLOADING,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Presigned upload URL generated successfully',
        data: {
          recordingId: recording.id,
          uploadUrl: presigned.uploadUrl,
          audioKey: presigned.audioKey,
          expiresInSec: presigned.expiresInSec,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async triggerProcessing(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recordingId = req.params.recordingId as string;
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw new AppError('Workspace context is required', 400);
      }
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const recording = await prisma.recording.findFirst({
        where: { id: recordingId, workspaceId },
      });

      if (!recording) {
        throw new AppError('Recording not found in this workspace', 404);
      }

      // Generate download / access URL for the audio
      const downloadUrl = await storageService.generatePresignedDownloadUrl(recording.audioUrl);

      // Queue Audio Job in Redis / in-process worker
      await addAudioProcessingJob({
        recordingId: recording.id,
        workspaceId: recording.workspaceId,
        userId: req.user.id,
        audioUrl: downloadUrl,
        audioKey: recording.audioUrl,
        audioFormat: recording.audioFormat,
        fileSizeBytes: recording.fileSizeBytes,
        durationSec: recording.audioDurationSec,
        customerOverrideId: req.body.customerId,
        jobCategoryOverride: req.body.jobCategory,
      });

      res.status(202).json({
        success: true,
        message: 'Recording queued for STT and LLM entity extraction',
        data: {
          recordingId: recording.id,
          status: ProcessingStatus.TRANSCRIBING,
          estimatedDurationSec: Math.max(2.0, parseFloat(((recording.audioDurationSec || 30) * 0.08).toFixed(1))),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecording(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recordingId = req.params.recordingId as string;
      const workspaceId = req.workspaceId;

      const recording = await prisma.recording.findFirst({
        where: { id: recordingId, ...(workspaceId ? { workspaceId } : {}) },
        include: {
          customer: true,
          job: true,
          extractedData: true,
          tasks: true,
          createdBy: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
        },
      });

      if (!recording) {
        throw new AppError('Recording not found', 404);
      }

      // Generate fresh signed playback URL
      const playbackUrl = await storageService.generatePresignedDownloadUrl(recording.audioUrl);

      res.status(200).json({
        success: true,
        data: {
          ...recording,
          playbackUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listRecordings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw new AppError('Workspace context is required', 400);
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;
      const status = req.query.status as ProcessingStatus | undefined;

      const where: any = { workspaceId };
      if (status) where.status = status;

      const [total, recordings] = await Promise.all([
        prisma.recording.count({ where }),
        prisma.recording.findMany({
          where,
          include: {
            customer: true,
            job: true,
            extractedData: true,
            createdBy: { select: { id: true, fullName: true } },
          },
          orderBy: { recordedAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          recordings,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async reExtract(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recordingId = req.params.recordingId as string;
      const { promptAdjustment } = req.body;
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw new AppError('Workspace context is required', 400);
      }
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const recording = await prisma.recording.findFirst({
        where: { id: recordingId, workspaceId },
        include: { workspace: true },
      });

      if (!recording || !recording.rawTranscript) {
        throw new AppError('Recording or transcript not found for re-extraction', 404);
      }

      // Perform real-time re-extraction with prompt adjustment
      const extraction = await llmService.extractEntities(recording.rawTranscript, {
        industry: recording.workspace.industry || undefined,
        promptAdjustment,
      });

      // Upsert entities
      const result = await EntityUpsertService.processAndUpsert({
        recordingId: recording.id,
        workspaceId: recording.workspaceId,
        userId: req.user.id,
        extraction,
        customerOverrideId: recording.customerId || undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Re-extraction applied and CRM updated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== MOCK / LOCAL STORAGE STREAMING ====================

  static async handleMockUpload(req: any, res: Response): Promise<void> {
    try {
      const key = decodeURIComponent(req.params.key as string);
      const uploadDir = path.resolve(process.cwd(), './uploads');
      const targetPath = path.join(uploadDir, key.replace(/\//g, '_'));

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Stream body to file
      const writeStream = fs.createWriteStream(targetPath);
      req.pipe(writeStream);

      writeStream.on('finish', () => {
        res.status(200).json({ success: true, message: 'Audio uploaded locally' });
      });

      writeStream.on('error', (err) => {
        res.status(500).json({ success: false, error: err.message });
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async handleMockAudioStream(req: any, res: Response): Promise<void> {
    try {
      const key = decodeURIComponent(req.params.key as string);
      const uploadDir = path.resolve(process.cwd(), './uploads');
      const targetPath = path.join(uploadDir, key.replace(/\//g, '_'));

      if (fs.existsSync(targetPath)) {
        res.setHeader('Content-Type', 'audio/mp4');
        fs.createReadStream(targetPath).pipe(res);
      } else {
        res.status(200).send('mock-audio-data');
      }
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'Audio file not found' });
    }
  }
}
