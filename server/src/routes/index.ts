import { Router } from 'express';
import authRoutes from './auth';
import boardRoutes from './boards';
import columnRoutes from './columns';
import healthRoutes from './healthRoutes';
import taskRoutes from './tasks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/columns', columnRoutes);
router.use('/tasks', taskRoutes);
router.use('/', healthRoutes);

export default router;
