import type { NextFunction, Request, Response } from 'express';
import { ColumnError, createColumn, deleteColumn, renameColumn, reorderColumn } from '../services/columnService';
import type { ColumnIdParams, CreateColumnBody, ReorderColumnBody, UpdateColumnBody } from '../validators/column';

export async function postColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const column = await createColumn(req.authUser.id, req.body as CreateColumnBody);
    res.status(201).json(column);
  } catch (error: unknown) {
    if (error instanceof ColumnError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function putColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as ColumnIdParams;

  try {
    const column = await renameColumn(req.authUser.id, id, req.body as UpdateColumnBody);
    res.status(200).json(column);
  } catch (error: unknown) {
    if (error instanceof ColumnError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function patchColumnOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as ColumnIdParams;

  try {
    const column = await reorderColumn(req.authUser.id, id, req.body as ReorderColumnBody);
    res.status(200).json(column);
  } catch (error: unknown) {
    if (error instanceof ColumnError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as ColumnIdParams;

  try {
    await deleteColumn(req.authUser.id, id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof ColumnError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
