import { Router } from 'express';
import authRoutes from './auth';
import boardRoutes from './boards';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/', healthRoutes);

export default router;
