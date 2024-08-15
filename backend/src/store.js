import RedisStore from 'connect-redis';
import redis from 'redis';

export default function connectStore(store) {
  if (store === 'redis') {
    // Create redis client
    const redisClient = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    // Connect to redis
    redisClient.connect().catch(console.error);

    // Redis client events
    redisClient.on('error', (err) => console.log(err));
    redisClient.on('connect', () =>
      console.log(
        `Connected to Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      )
    );

    // Create redis store
    return new RedisStore({
      client: redisClient,
    });
  }

  return undefined;
}
