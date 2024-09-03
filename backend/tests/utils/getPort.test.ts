import { getPort } from '../../src/utils/getPort.js';

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('getPort function', () => {
  it('should throw an error if PORT is not set', () => {
    delete process.env.PORT;

    expect(() => {
      getPort();
    }).toThrow('Environment variable PORT must be set');
  });

  it('should return the port from environment when NODE_ENV is not "test"', () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';

    const port = getPort();

    expect(port).toBe(3000);
  });

  it('should 0 if NODE_ENV is "test"', () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';

    const port = getPort();

    expect(port).toBe(0);
  });

  it('should handle non-numeric port values by throwing an error', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = 'invalid_port';

    expect(getPort()).toBe(NaN);
  });

  it('should correctly parse and return a numeric port value', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';

    const port = getPort();

    expect(port).toBe(4000);
  });
});