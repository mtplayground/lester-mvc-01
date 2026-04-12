import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { LoginBodySchema, RegisterBodySchema } from '../validators/auth';

const authRoutes = Router();

authRoutes.post('/register', validateRequest({ body: RegisterBodySchema }), register);
authRoutes.post('/login', validateRequest({ body: LoginBodySchema }), login);
authRoutes.get('/me', requireAuth, getMe);

export default authRoutes;
