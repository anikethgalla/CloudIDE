import Redis from 'ioredis';
import { config } from './index';

let redisClient: Redis | null = null;
let isRedisConnected = false;

export function getRedisConnection(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 5) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✔ Connected to Redis server successfully.');
    });

    redisClient.on('error', () => {
      isRedisConnected = false;
    });
  }

  return redisClient;
}

export function isRedisAvailable(): boolean {
  return isRedisConnected;
}
