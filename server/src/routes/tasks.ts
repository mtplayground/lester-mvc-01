import { Router } from 'express';
import { deleteTaskById, getTask, getTasksByColumn, patchTaskReorder, postTask, putTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { BulkReorderTasksBodySchema, CreateTaskBodySchema, TaskColumnParamsSchema, TaskIdParamsSchema, UpdateTaskBodySchema } from '../validators/task';

const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get('/column/:columnId', validateRequest({ params: TaskColumnParamsSchema }), getTasksByColumn);
taskRoutes.get('/:id', validateRequest({ params: TaskIdParamsSchema }), getTask);
taskRoutes.post('/', validateRequest({ body: CreateTaskBodySchema }), postTask);
taskRoutes.put('/:id', validateRequest({ params: TaskIdParamsSchema, body: UpdateTaskBodySchema }), putTask);
taskRoutes.delete('/:id', validateRequest({ params: TaskIdParamsSchema }), deleteTaskById);
taskRoutes.patch('/reorder', validateRequest({ body: BulkReorderTasksBodySchema }), patchTaskReorder);

export default taskRoutes;
