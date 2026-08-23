import { Queue } from 'bullmq';
import { redisConnectionConfig, checkRedisHealth } from './redis.connection.js';
import { AudioProcessingJobData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { processAudioJob } from './audio.worker.js';

export const AUDIO_QUEUE_NAME = 'audio-processing';

let audioQueue: Queue<AudioProcessingJobData> | null = null;
let isRedisAvailable = false;

export async function initAudioQueue(): Promise<Queue<AudioProcessingJobData> | null> {
  try {
    const isHealthy = await checkRedisHealth();
    if (!isHealthy) {
      isRedisAvailable = false;
      logger.warn('Redis not detected on localhost:6379. Audio worker will process jobs using asynchronous in-process queue.');
      return null;
    }

    audioQueue = new Queue<AudioProcessingJobData>(AUDIO_QUEUE_NAME, {
      connection: redisConnectionConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });

    isRedisAvailable = true;
    logger.info('BullMQ Audio Processing Queue connected to Redis');
    return audioQueue;
  } catch (error) {
    isRedisAvailable = false;
    logger.warn('Redis unavailable for BullMQ. Using asynchronous in-process worker pipeline fallback.');
    return null;
  }
}

export async function addAudioProcessingJob(data: AudioProcessingJobData): Promise<void> {
  if (isRedisAvailable && audioQueue) {
    await audioQueue.add(`process-${data.recordingId}`, data, {
      jobId: data.recordingId, // Idempotency
    });
    logger.info(`Queued audio processing job in BullMQ for recording ${data.recordingId}`);
  } else {
    // Asynchronous in-process fallback execution
    logger.info(`Running in-process async pipeline for recording ${data.recordingId}`);
    setImmediate(async () => {
      try {
        await processAudioJob(data);
      } catch (err) {
        logger.error(`In-process audio processing failed for ${data.recordingId}:`, err);
      }
    });
  }
}
