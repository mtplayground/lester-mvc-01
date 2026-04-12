import { Router } from 'express';
import { deleteTaskAssignment, getAssignableUsers, postTaskAssignment } from '../controllers/assignmentController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { AssignmentBodySchema, AssignmentUsersQuerySchema } from '../validators/assignment';

const assignmentRoutes = Router();

assignmentRoutes.use(requireAuth);

assignmentRoutes.get('/users', validateRequest({ query: AssignmentUsersQuerySchema }), getAssignableUsers);
assignmentRoutes.post('/', validateRequest({ body: AssignmentBodySchema }), postTaskAssignment);
assignmentRoutes.delete('/', validateRequest({ body: AssignmentBodySchema }), deleteTaskAssignment);

export default assignmentRoutes;
