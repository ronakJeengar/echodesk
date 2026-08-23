import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/echodesk?schema=public',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'echodesk_jwt_secret_dev_key_super_secure_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'echodesk_jwt_refresh_secret_dev_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  storage: {
    driver: (process.env.STORAGE_DRIVER || 'mock') as 's3' | 'local' | 'mock',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET_NAME || 'echodesk-audio-recordings',
    endpoint: process.env.S3_ENDPOINT || undefined,
    localDir: path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR || './uploads'),
  },

  ai: {
    sttProvider: (process.env.STT_PROVIDER || 'mock') as 'deepgram' | 'whisper' | 'mock',
    llmProvider: (process.env.LLM_PROVIDER || 'mock') as 'openai' | 'anthropic' | 'gemini' | 'mock',
    llmModel: process.env.LLM_MODEL || 'gpt-4o',
    deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
};
