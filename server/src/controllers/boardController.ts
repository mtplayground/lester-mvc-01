import type { NextFunction, Request, Response } from 'express';
import { BoardError, createBoard, deleteBoard, listBoards, updateBoard } from '../services/boardService';
import type { BoardIdParams, CreateBoardBody, UpdateBoardBody } from '../validators/board';

export async function getBoards(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const boards = await listBoards(req.authUser.id);
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
}

export async function postBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const board = await createBoard(req.authUser.id, req.body as CreateBoardBody);
    res.status(201).json(board);
  } catch (error: unknown) {
    if (error instanceof BoardError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function putBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as BoardIdParams;

  try {
    const board = await updateBoard(req.authUser.id, id, req.body as UpdateBoardBody);
    res.status(200).json(board);
  } catch (error: unknown) {
    if (error instanceof BoardError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as BoardIdParams;

  try {
    await deleteBoard(req.authUser.id, id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof BoardError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
