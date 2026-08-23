import { Router } from 'express';
import {
  RecordingsController,
  presignedUrlSchema,
  processRecordingSchema,
  reExtractSchema,
} from '../controllers/recordings.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const recordingsRouter = Router();

// Presigned URL generation for audio upload
recordingsRouter.post(
  '/presigned-url',
  authenticate,
  validate({ body: presignedUrlSchema }),
  RecordingsController.requestPresignedUrl
);

// Trigger AI Processing pipeline
recordingsRouter.post(
  '/:recordingId/process',
  authenticate,
  validate({ body: processRecordingSchema }),
  RecordingsController.triggerProcessing
);

// Get recording details + extracted JSON
recordingsRouter.get('/:recordingId', authenticate, RecordingsController.getRecording);

// List workspace recordings
recordingsRouter.get('/', authenticate, RecordingsController.listRecordings);

// Re-prompt / entity correction
recordingsRouter.post(
  '/:recordingId/re-extract',
  authenticate,
  validate({ body: reExtractSchema }),
  RecordingsController.reExtract
);

// Local / mock upload and stream handlers
recordingsRouter.put('/upload-mock/:key', RecordingsController.handleMockUpload);
recordingsRouter.get('/audio-stream/:key', RecordingsController.handleMockAudioStream);
