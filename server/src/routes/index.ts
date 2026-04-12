import { Router } from 'express';
import authRoutes from './auth';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', healthRoutes);

export default router;
