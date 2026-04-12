import type { NextFunction, Request, Response } from 'express';
import {
  CommentError,
  createComment,
  deleteComment,
  listCommentsByTask,
  updateComment
} from '../services/commentService';
import type { CommentIdParams, CommentTaskQuery, CreateCommentBody, UpdateCommentBody } from '../validators/comment';

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId } = req.query as CommentTaskQuery;

  try {
    const comments = await listCommentsByTask(req.authUser.id, taskId);
    res.status(200).json(comments);
  } catch (error: unknown) {
    if (error instanceof CommentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function postComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const comment = await createComment(req.authUser.id, req.body as CreateCommentBody);
    res.status(201).json(comment);
  } catch (error: unknown) {
    if (error instanceof CommentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function putComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as CommentIdParams;

  try {
    const comment = await updateComment(req.authUser.id, id, req.body as UpdateCommentBody);
    res.status(200).json(comment);
  } catch (error: unknown) {
    if (error instanceof CommentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as CommentIdParams;

  try {
    await deleteComment(req.authUser.id, id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof CommentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
