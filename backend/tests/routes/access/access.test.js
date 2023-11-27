import app from '../../../src/app';
import request from 'supertest';

describe('User Access Tests', () => {
  // retrieve a test user email and password from the environment
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  it('should allow valid user registration', async () => {
    const response = await request(app)
      .post('/access/register')
      .send({ fname: 'Test', lname: 'Test', email: 'test@test.com', password: 'password' });
    expect(response.statusCode).toBe(201);
  });

  it('should allow valid user login', async () => {
    const response = await request(app)
      .post('/access/login')
      .send({ email, password });
    expect(response.statusCode).toBe(200);
  });

  it('should deny user login with incorrect password', async () => {
    const response = await request(app)
      .post('/access/login')
      .send({ email: 'alicej92@berkeley.edu', password: 'wrongpassword' });
    expect(response.statusCode).toBe(401);
  });

  it('should deny user login with incorrect email', async () => {
    const response = await request(app)
      .post('/access/login')
      .send({ email: 'wrongemail@berkeley.edu', password: 'gobears!2014' });
    expect(response.statusCode).toBe(401);
  });

  it('should allow user logout', async () => {
    // First login the user
    await request(app)
      .post('/access/login')
      .send({ email: 'alicej92@berkeley.edu', password: 'gobears!2014' });

    // Then attempt to logout
    const response = await request(app)
      .get('/access/logout');
    expect(response.statusCode).toBe(200);
  });

  it('should deny registration with an existing email', async () => {
    const response = await request(app)
      .post('/access/register')
      .send({ fname: 'Alice', lname: 'Johnson', email: 'alicej92@berkeley.edu', password: 'gobears!2014' });
    expect(response.statusCode).toBe(409);
  });

  it('should handle logout when not logged in', async () => {
    const response = await request(app)
      .get('/access/logout');
    expect(response.statusCode).toBe(200);
  });
});
