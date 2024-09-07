import 'dotenv/config';

import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { createStore } from '../src/store.js';

jest.mock('redis');
jest.mock('connect-redis');

describe('createStore', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return undefined when store is not "redis"', () => {
    const result = createStore('memory');
    expect(result).toBeUndefined();
  });

  it('should create and return a RedisStore when store is "redis"', () => {
    const mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    const mockRedisStore = jest.fn().mockImplementation(() => ({ store: 'redis' }));

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);
    (RedisStore as unknown as jest.Mock).mockImplementation(mockRedisStore);

    const result = createStore('redis');

    expect(createClient).toHaveBeenCalledWith({
      socket: {
        host: process.env.REDIS_HOST,
        port: 6379
      }
    });
    expect(mockRedisClient.connect).toHaveBeenCalled();
    expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockRedisStore).toHaveBeenCalledWith({ client: mockRedisClient });
    expect(result).toEqual({ store: 'redis' });
  });

  it('should throw an error if REDIS_HOST is not set', () => {
    delete process.env.REDIS_HOST;

    expect(() => createStore('redis')).toThrow('REDIS_HOST is not set in .env file');
  });

  it('should use default port 6379 if REDIS_PORT is not set', () => {
    delete process.env.REDIS_PORT;

    const mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    createStore('redis');

    expect(createClient).toHaveBeenCalledWith({
      socket: {
        host: process.env.REDIS_HOST,
        port: undefined // Default port 6379
      }
    });
  });

  it('should parse REDIS_PORT as an integer when set', () => {
    process.env.REDIS_PORT = '1234';

    const mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    createStore('redis');

    expect(createClient).toHaveBeenCalledWith({
      socket: {
        host: process.env.REDIS_HOST,
        port: 1234
      }
    });
  });

  it('should log error when Redis connection fails', async () => {
    const mockRedisClient = {
      connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    createStore('redis');

    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith(new Error('Connection failed'));
    consoleSpy.mockRestore();
  });

  it('should log successful connection to Redis', () => {
    const mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    createStore('redis');

    const connectHandler = mockRedisClient.on.mock.calls.find(call => call[0] === 'connect')[1];
    connectHandler();

    expect(consoleSpy).toHaveBeenCalledWith(`Connected to Redis: ${process.env.REDIS_HOST}:6379`);
    consoleSpy.mockRestore();
  });

  it('should return a Store object when store is "redis"', () => {
    const mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    const mockRedisStore = jest.fn().mockImplementation(() => ({ store: 'redis' }));

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);
    (RedisStore as unknown as jest.Mock).mockImplementation(mockRedisStore);

    const result = createStore('redis');

    expect(result).toBeDefined();
    expect(result).toHaveProperty('store', 'redis');
    expect(result).toBeInstanceOf(Object);
  });
});