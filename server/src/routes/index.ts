import { Router } from 'express';
import assignmentRoutes from './assignments';
import authRoutes from './auth';
import boardRoutes from './boards';
import columnRoutes from './columns';
import healthRoutes from './healthRoutes';
import labelRoutes from './labels';
import taskRoutes from './tasks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/boards', boardRoutes);
router.use('/columns', columnRoutes);
router.use('/labels', labelRoutes);
router.use('/tasks', taskRoutes);
router.use('/', healthRoutes);

export default router;
