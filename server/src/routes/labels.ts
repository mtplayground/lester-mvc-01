import { Router } from 'express';
import {
  deleteTaskLabel,
  getLabels,
  postLabel,
  postTaskLabel,
  putLabel,
  removeLabel
} from '../controllers/labelController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import {
  CreateLabelBodySchema,
  LabelBoardQuerySchema,
  LabelIdParamsSchema,
  LabelTaskLinkBodySchema,
  UpdateLabelBodySchema
} from '../validators/label';

const labelRoutes = Router();

labelRoutes.use(requireAuth);

labelRoutes.get('/', validateRequest({ query: LabelBoardQuerySchema }), getLabels);
labelRoutes.post('/', validateRequest({ body: CreateLabelBodySchema }), postLabel);
labelRoutes.post('/tasks', validateRequest({ body: LabelTaskLinkBodySchema }), postTaskLabel);
labelRoutes.delete('/tasks', validateRequest({ body: LabelTaskLinkBodySchema }), deleteTaskLabel);
labelRoutes.put('/:id', validateRequest({ params: LabelIdParamsSchema, body: UpdateLabelBodySchema }), putLabel);
labelRoutes.delete('/:id', validateRequest({ params: LabelIdParamsSchema }), removeLabel);

export default labelRoutes;
