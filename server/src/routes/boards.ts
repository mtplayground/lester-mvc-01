import { Router } from 'express';
import { getBoards, postBoard, putBoard, removeBoard } from '../controllers/boardController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { BoardIdParamsSchema, CreateBoardBodySchema, UpdateBoardBodySchema } from '../validators/board';

const boardRoutes = Router();

boardRoutes.use(requireAuth);

boardRoutes.get('/', getBoards);
boardRoutes.post('/', validateRequest({ body: CreateBoardBodySchema }), postBoard);
boardRoutes.put('/:id', validateRequest({ params: BoardIdParamsSchema, body: UpdateBoardBodySchema }), putBoard);
boardRoutes.delete('/:id', validateRequest({ params: BoardIdParamsSchema }), removeBoard);

export default boardRoutes;
