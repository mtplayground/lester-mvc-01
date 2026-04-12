import request from 'supertest';
import app from '../app';
import { authHeader } from './helpers';

describe('Auth API', () => {
  it('registers, logs in, and returns current user', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Auth User',
      email: 'auth-user@example.com',
      password: 'Password123!'
    });

    expect(registerResponse.status).toBe(201);
    expect(typeof registerResponse.body.token).toBe('string');

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'auth-user@example.com',
      password: 'Password123!'
    });

    expect(loginResponse.status).toBe(200);
    expect(typeof loginResponse.body.token).toBe('string');

    const meResponse = await request(app).get('/api/auth/me').set(authHeader(loginResponse.body.token));

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toMatchObject({
      email: 'auth-user@example.com',
      name: 'Auth User'
    });
  });

  it('returns conflict on duplicate registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'dup-user@example.com',
      password: 'Password123!'
    });

    const duplicateResponse = await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'dup-user@example.com',
      password: 'Password123!'
    });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toBe('Email already registered');
  });

  it('returns unauthorized for invalid login credentials', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'missing-user@example.com',
      password: 'invalid'
    });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.message).toBe('Invalid email or password');
  });

  it('returns unauthorized when /me is requested without token', async () => {
    const meResponse = await request(app).get('/api/auth/me');

    expect(meResponse.status).toBe(401);
    expect(meResponse.body.message).toBe('Unauthorized');
  });
});
