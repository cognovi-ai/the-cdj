/**
 * Tests the error handlers in app.ts along mocked entries routes.
 */

import app from '../src/app.js';
import request from 'supertest';

describe('App Error Handler', () => {
  it('should use the error handler to return a flash error message', async () => {
    const response = await request(app)
      .get('/nonexistent-route')
      .expect(404)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('flash');
    expect(response.body.flash).toHaveProperty('info');
    expect(response.body.flash.info[0]).toBe('Page Not Found.');
  });
});