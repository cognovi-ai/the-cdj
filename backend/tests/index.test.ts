import { server } from '../src/index.ts';
import { seedDatabase, teardownDatabase } from '../data/seed.js';

global.console.log = jest.fn();

beforeAll(async () => {
  await seedDatabase();
});

afterAll(async () => {
  console.log('Teardown: Dropping test database...');
  await teardownDatabase();
  server.close();
});

describe('Server startup', () => {
  it('should start the server in non-production mode', (done) => {
    process.env.NODE_ENV = 'development';
    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(
        `\nExpress listening on port ${process.env.PORT}`
      );
      done();
    }, 1000);
  });
});
