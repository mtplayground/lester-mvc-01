import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import { EmptyQuerySchema, validateRequest } from '../validators';

const healthRoutes = Router();

healthRoutes.get('/health', validateRequest({ query: EmptyQuerySchema }), getHealth);

export default healthRoutes;
