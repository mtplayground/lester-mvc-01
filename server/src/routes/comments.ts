import { Router } from 'express';
import { getComments, postComment, putComment, removeComment } from '../controllers/commentController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../validators';
import { CommentIdParamsSchema, CommentTaskQuerySchema, CreateCommentBodySchema, UpdateCommentBodySchema } from '../validators/comment';

const commentRoutes = Router();

commentRoutes.use(requireAuth);

commentRoutes.get('/', validateRequest({ query: CommentTaskQuerySchema }), getComments);
commentRoutes.post('/', validateRequest({ body: CreateCommentBodySchema }), postComment);
commentRoutes.put('/:id', validateRequest({ params: CommentIdParamsSchema, body: UpdateCommentBodySchema }), putComment);
commentRoutes.delete('/:id', validateRequest({ params: CommentIdParamsSchema }), removeComment);

export default commentRoutes;
