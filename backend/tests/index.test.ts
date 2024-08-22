import mongoose from 'mongoose';
import { server } from '../src/index.ts';

global.console.log = jest.fn();

describe('Server startup', () => {
  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

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
