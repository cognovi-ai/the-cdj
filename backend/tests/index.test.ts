global.console.log = jest.fn();

import { server } from '../src/index.ts';
import { db } from '../src/db.js';

describe('Server startup', () => {
  afterAll(async () => {
    server.close();
    await db.connection.close();
  });

  it('should start the server in non-production mode', (done) => {
    process.env.NODE_ENV = 'development';
    require('../src/index');
    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(`\nExpress listening on port ${process.env.PORT}`);
      done();
    }, 1000);
  });
});