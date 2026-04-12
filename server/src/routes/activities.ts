import { Router } from 'express';
import { getTaskActivityFeed } from '../controllers/activityController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { ActivityTaskQuerySchema } from '../validators/activity';

const activityRoutes = Router();

activityRoutes.use(requireAuth);

activityRoutes.get('/', validateRequest({ query: ActivityTaskQuerySchema }), getTaskActivityFeed);

export default activityRoutes;
