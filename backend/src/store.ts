import RedisStore from 'connect-redis';
import { Store } from 'express-session';
import { createClient } from 'redis';

/**
 * Create a session store based on the store type.
 * 
 * @param {string} store - The name of the store.
 * @returns The session store object or undefined.
 **/ 
export function createStore(store: string): Store | undefined {
  if (store === 'redis') {
    let redisPort: number | undefined;
    const { REDIS_HOST, REDIS_PORT } = process.env;

    if (!REDIS_HOST) throw new Error('REDIS_HOST is not set in .env file');
    if (REDIS_PORT) redisPort = parseInt(REDIS_PORT, 10);
    
    // Create redis client
    const redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: redisPort || undefined,
      }
    });

    // Connect to redis
    redisClient.connect().catch(console.error);

    // Redis client events
    redisClient.on('error', (err) => console.error(err));
    redisClient.on('connect', () =>
      console.log(
        `Connected to Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      )
    );

    // Create redis store
    return new RedisStore({
      client: redisClient,
    }) as Store;
  }

  return undefined;
}