import { seedDatabase, teardownDatabase } from '../data/seed.js';
import { server } from '../src/index.js';

global.console.log = jest.fn();

beforeAll(async () => {
  await seedDatabase();
});

afterAll(async () => {
  console.log('Teardown: Dropping test database...');
  await teardownDatabase();
  server?.close();
});

describe('Server startup', () => {
  it('should start the server in non-production mode', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const address = server?.address();
    if (address && typeof address !== 'string') {
      const { port } = address;
      expect(console.log).toHaveBeenCalledWith(`\nHTTP Express listening on port ${port}`);
    }
  });
});
