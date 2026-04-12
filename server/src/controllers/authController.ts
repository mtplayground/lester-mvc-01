import type { NextFunction, Request, Response } from 'express';
import { AuthError, loginUser, registerUser } from '../services/authService';
import type { LoginBody, RegisterBody } from '../validators/auth';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerUser(req.body as RegisterBody);
    res.status(201).json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginUser(req.body as LoginBody);
    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.status(200).json(req.authUser);
}
