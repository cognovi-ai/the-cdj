/**
 * @jest-environment node
 */
import app from '../../../src/app.js';
import request from 'supertest';

jest.mock('../../../src/controllers/access/access.js');

describe('access router for /access paths', () => {
  const testId = 'testId';

  it('should have /access/journal/:journalId PUT route', async () => {
    const response = await request(app).put(`/access/journal/${testId}`).send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/:journalId/account GET route', async () => {
    const response = await request(app).get(`/access/${testId}/account`).send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/:journalId/account PUT route', async () => {
    const response = await request(app).put(`/access/${testId}/account`).send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/:journalId/account DELETE route', async () => {
    const response = await request(app).delete(`/access/${testId}/account`).send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/login POST route', async () => {
    const response = await request(app).post('/access/login').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/token-login POST route', async () => {
    const response = await request(app).post('/access/token-login').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/forgot-password POST route', async () => {
    const response = await request(app).post('/access/forgot-password').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/reset-password POST route', async () => {
    const response = await request(app).post('/access/reset-password').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/logout GET route', async () => {
    const response = await request(app).get('/access/logout');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/register POST route', async () => {
    const response = await request(app).post('/access/register').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/verify-email POST route', async () => {
    const response = await request(app).post('/access/verify-email').send('{}');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/beta-approval GET route', async () => {
    const response = await request(app).get('/access/beta-approval');
    expect(response.statusCode).not.toBe(404);
  });

  it('should have /access/beta-denial GET route', async () => {
    const response = await request(app).get('/access/beta-denial');
    expect(response.statusCode).not.toBe(404);
  });
});