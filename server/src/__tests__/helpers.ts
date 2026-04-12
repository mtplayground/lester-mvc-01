import request from 'supertest';
import app from '../app';

interface AuthContext {
  userId: string;
  token: string;
  email: string;
  name: string;
}

export function authHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function registerAndLogin(suffix: string): Promise<AuthContext> {
  const name = `User ${suffix}`;
  const email = `user-${suffix}@example.com`;
  const password = 'Password123!';

  const registerResponse = await request(app).post('/api/auth/register').send({
    name,
    email,
    password
  });

  if (registerResponse.status !== 201 || typeof registerResponse.body?.token !== 'string') {
    throw new Error(`Failed to register user for test setup: ${JSON.stringify(registerResponse.body)}`);
  }

  const meResponse = await request(app).get('/api/auth/me').set(authHeader(registerResponse.body.token));

  if (meResponse.status !== 200 || typeof meResponse.body?.id !== 'string') {
    throw new Error(`Failed to resolve test user profile: ${JSON.stringify(meResponse.body)}`);
  }

  return {
    userId: meResponse.body.id,
    token: registerResponse.body.token,
    email,
    name
  };
}
