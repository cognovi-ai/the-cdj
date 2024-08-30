import { seedDatabase, teardownDatabase } from '../data/seed.js';
import { server } from '../src/index.ts';

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
  it('should start the server in non-production mode', async () => {
    process.env.NODE_ENV = 'development';
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
  
    setTimeout(() => {
      // Check that console.log was called with a port between 1 and 5 digits.
      const portRegex = /\nExpress listening on port \d{1,5}/;
      
      expect(console.log).toHaveBeenCalledWith(expect.stringMatching(portRegex));
    }, 1000);
  });
});
