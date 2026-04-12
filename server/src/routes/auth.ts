import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validateRequest } from '../validators';
import { LoginBodySchema, RegisterBodySchema } from '../validators/auth';

const authRoutes = Router();

authRoutes.post('/register', validateRequest({ body: RegisterBodySchema }), register);
authRoutes.post('/login', validateRequest({ body: LoginBodySchema }), login);

export default authRoutes;
