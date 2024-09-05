/* eslint-disable jest/no-disabled-tests */
/* eslint-disable sort-imports */

import 'dotenv/config';

import connectDB from '../src/db.js';
import mongoose from 'mongoose';

// Mock the mongoose module
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

// Mock console.log and console.error
console.log = jest.fn();
console.error = jest.fn();

describe('connectDB', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it.skip('should connect to MongoDB Atlas in production environment', async () => {
    process.env.NODE_ENV = 'production';
    const atlasUri = process.env.ATLAS_URI;

    await connectDB('testdb');

    expect(mongoose.connect).toHaveBeenCalledWith(atlasUri);
    expect(console.log).toHaveBeenCalledWith('Connected to MongoDB Atlas');
  });

  it('should connect to local MongoDB in development environment', async () => {
    process.env.NODE_ENV = 'development';
    const mongoUri = process.env.MONGO_URI;

    await connectDB('testdb');

    expect(mongoose.connect).toHaveBeenCalledWith(`${mongoUri}/testdb`);
    expect(console.log).toHaveBeenCalledWith(`Connected to local MongoDB: ${mongoUri}/testdb`);
  });

  it('should connect to local test MongoDB in test environment', async () => {
    process.env.NODE_ENV = 'test';

    await connectDB('testdb');

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb-test');
    expect(console.log).toHaveBeenCalledWith('Connected to local test MongoDB: testdb-test');
  });

  it('should throw an error if local MongoDB connection fails', async () => {
    const mockError = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValue(mockError);

    await expect(connectDB('testdb')).rejects.toThrow('Connection failed');
    expect(console.error).toHaveBeenCalledWith('Database connection error:', mockError);
  });

  it('should throw an error if production environment variables are missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ATLAS_URI;

    await expect(connectDB('testdb')).rejects.toThrow('ATLAS_URI is not defined in the environment variables');
  });
});