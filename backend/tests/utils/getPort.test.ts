import getPort from '../../src/utils/getPort';

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('getPort function', () => {
  it('should throw an error if PORT is not set', async () => {
    delete process.env.PORT;

    await expect(getPort()).rejects.toThrow('Environment variable PORT must be set');
  });

  it('should return the port from environment when NODE_ENV is not "test"', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';

    const port = await getPort();

    expect(port).toBe(3000);
  });

  it('should increment the port by 1 if NODE_ENV is "test"', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';

    const port = await getPort();

    expect(port).toBe(3001);
  });

  it('should handle non-numeric port values by throwing an error', async () => {
    process.env.PORT = 'invalid_port';

    await expect(getPort()).rejects.toThrow('NaN');
  });

  it('should correctly parse and return a numeric port value', async () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';

    const port = await getPort();

    expect(port).toBe(4000);
  });
});