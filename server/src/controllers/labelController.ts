import type { NextFunction, Request, Response } from 'express';
import {
  LabelError,
  attachLabelToTask,
  createLabel,
  deleteLabel,
  detachLabelFromTask,
  listLabels,
  updateLabel
} from '../services/labelService';
import type {
  CreateLabelBody,
  LabelBoardQuery,
  LabelIdParams,
  LabelTaskLinkBody,
  UpdateLabelBody
} from '../validators/label';

export async function getLabels(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { boardId } = req.query as LabelBoardQuery;

  try {
    const labels = await listLabels(req.authUser.id, boardId);
    res.status(200).json(labels);
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function postLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const label = await createLabel(req.authUser.id, req.body as CreateLabelBody);
    res.status(201).json(label);
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function putLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as LabelIdParams;

  if (Object.keys(req.body as Record<string, unknown>).length === 0) {
    res.status(400).json({ message: 'At least one field must be provided' });
    return;
  }

  try {
    const label = await updateLabel(req.authUser.id, id, req.body as UpdateLabelBody);
    res.status(200).json(label);
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function removeLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as LabelIdParams;

  try {
    await deleteLabel(req.authUser.id, id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function postTaskLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId, labelId } = req.body as LabelTaskLinkBody;

  try {
    const task = await attachLabelToTask(req.authUser.id, taskId, labelId);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function deleteTaskLabel(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId, labelId } = req.body as LabelTaskLinkBody;

  try {
    const task = await detachLabelFromTask(req.authUser.id, taskId, labelId);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof LabelError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
