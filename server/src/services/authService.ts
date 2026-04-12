import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import type { LoginBody, RegisterBody } from '../validators/auth';

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return secret;
}

const jwtSecret = getJwtSecret();
const jwtSignOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']
};

export class AuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

interface AuthResult {
  token: string;
}

function signToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, jwtSecret, jwtSignOptions);
}

export async function registerUser(input: RegisterBody): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new AuthError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name
    }
  });

  return {
    token: signToken(user.id, user.email)
  };
}

export async function loginUser(input: LoginBody): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthError('Invalid email or password', 401);
  }

  return {
    token: signToken(user.id, user.email)
  };
}
