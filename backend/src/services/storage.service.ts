import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

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

class StorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (config.storage.driver === 's3' && config.storage.accessKeyId && config.storage.secretAccessKey) {
      this.s3Client = new S3Client({
        region: config.storage.region,
        credentials: {
          accessKeyId: config.storage.accessKeyId,
          secretAccessKey: config.storage.secretAccessKey,
        },
        ...(config.storage.endpoint ? { endpoint: config.storage.endpoint, forcePathStyle: true } : {}),
      });
      logger.info('Initialized AWS S3 / Cloudflare R2 client');
    } else {
      logger.info(`Storage operating in '${config.storage.driver}' mode`);
      if (config.storage.driver === 'local') {
        if (!fs.existsSync(config.storage.localDir)) {
          fs.mkdirSync(config.storage.localDir, { recursive: true });
        }
      }
    }
  }

  async generatePresignedUploadUrl(params: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const { workspaceId, recordingId, audioFormat } = params;
    const sanitizedFormat = audioFormat.replace(/^\./, '').toLowerCase();
    const audioKey = `audio/${workspaceId}/${recordingId}.${sanitizedFormat}`;
    const expiresInSec = 900; // 15 minutes TTL

    if (this.s3Client && config.storage.driver === 's3') {
      const command = new PutObjectCommand({
        Bucket: config.storage.bucket,
        Key: audioKey,
        ContentType: this.getContentType(sanitizedFormat),
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSec });
      return {
        recordingId,
        uploadUrl,
        audioKey,
        expiresInSec,
      };
    }

    // Local / Mock fallback upload URL
    const baseUrl = `http://localhost:${config.port}${config.apiPrefix}`;
    const uploadUrl = `${baseUrl}/recordings/upload-mock/${encodeURIComponent(audioKey)}`;

    return {
      recordingId,
      uploadUrl,
      audioKey,
      expiresInSec,
    };
  }

  async generatePresignedDownloadUrl(audioKey: string): Promise<string> {
    const expiresInSec = 3600; // 1 hour TTL

    if (this.s3Client && config.storage.driver === 's3') {
      const command = new GetObjectCommand({
        Bucket: config.storage.bucket,
        Key: audioKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSec });
    }

    // Local / Mock fallback download URL
    return `http://localhost:${config.port}${config.apiPrefix}/recordings/audio-stream/${encodeURIComponent(audioKey)}`;
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'm4a':
      case 'aac':
        return 'audio/mp4';
      case 'mp3':
        return 'audio/mpeg';
      case 'opus':
      case 'ogg':
        return 'audio/ogg';
      case 'wav':
        return 'audio/wav';
      default:
        return 'audio/mp4';
    }
  }
}

export const storageService = new StorageService();
