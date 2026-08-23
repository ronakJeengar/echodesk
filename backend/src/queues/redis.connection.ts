import { Redis, RedisOptions } from 'ioredis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const redisConnectionConfig: RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 1000,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying quickly if Redis is offline
    return Math.min(times * 100, 1000);
  },
};

export async function checkRedisHealth(): Promise<boolean> {
  const client = new Redis(redisConnectionConfig);
  client.on('error', () => {
    // Silence connection error during health check
  });

  try {
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 1000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    await client.ping();
    await client.quit();
    return true;
  } catch (error) {
    try {
      client.disconnect();
    } catch {}
    return false;
  }
}
