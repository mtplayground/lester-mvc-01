import { Router } from 'express';
import { patchColumnOrder, postColumn, putColumn, removeColumn } from '../controllers/columnController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { ColumnIdParamsSchema, CreateColumnBodySchema, ReorderColumnBodySchema, UpdateColumnBodySchema } from '../validators/column';

const columnRoutes = Router();

columnRoutes.use(requireAuth);

columnRoutes.post('/', validateRequest({ body: CreateColumnBodySchema }), postColumn);
columnRoutes.put('/:id', validateRequest({ params: ColumnIdParamsSchema, body: UpdateColumnBodySchema }), putColumn);
columnRoutes.patch('/:id/reorder', validateRequest({ params: ColumnIdParamsSchema, body: ReorderColumnBodySchema }), patchColumnOrder);
columnRoutes.delete('/:id', validateRequest({ params: ColumnIdParamsSchema }), removeColumn);

export default columnRoutes;
