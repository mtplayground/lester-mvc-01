import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

interface TokenPayload extends JwtPayload {
  sub: string;
  email?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return secret;
}

const jwtSecret = getJwtSecret();

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorizationHeader = req.header('Authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;

    if (!payload.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.authUser = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
