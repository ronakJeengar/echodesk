import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { storageService } from '../src/services/storage.service.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { GlobalRole, WorkspaceRole } from '@prisma/client';

describe('API & Storage Integration Tests', () => {
  const app = createApp();

  describe('Storage Service Presigned URLs', () => {
    it('should generate a valid presigned upload URL and audioKey', async () => {
      const presigned = await storageService.generatePresignedUploadUrl({
        workspaceId: 'w-501',
        recordingId: 'rec-test-123',
        audioFormat: 'm4a',
        durationSec: 45.0,
      });

      expect(presigned.recordingId).toBe('rec-test-123');
      expect(presigned.audioKey).toBe('audio/w-501/rec-test-123.m4a');
      expect(presigned.uploadUrl).toBeDefined();
      expect(presigned.expiresInSec).toBe(900);
    });

    it('should generate a download playback URL for a stored key', async () => {
      const downloadUrl = await storageService.generatePresignedDownloadUrl('audio/w-501/rec-test-123.m4a');
      expect(downloadUrl).toBeDefined();
      expect(downloadUrl.length).toBeGreaterThan(10);
    });
  });

  describe('Root & Health Endpoints', () => {
    it('GET / should return 200 with service information', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toContain('EchoDesk');
    });

    it('GET /api/v1/health should return 200 healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('healthy');
    });

    it('GET /non-existent-route should return 404', async () => {
      const res = await request(app).get('/api/v1/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Validation Rules', () => {
    it('POST /api/v1/auth/register should fail on short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Dave Miller',
          email: 'dave@prohvac.com',
          password: 'short',
          workspaceName: 'Pro HVAC',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/v1/auth/login should fail on invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes without Token', () => {
    it('GET /api/v1/auth/me should return 401 Unauthorized without auth header', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/customers should return 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/customers');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
