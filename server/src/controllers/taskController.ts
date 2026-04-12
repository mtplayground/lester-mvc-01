import type { NextFunction, Request, Response } from 'express';
import { TaskError, bulkReorderTasks, createTask, deleteTask, getTaskById, listTasksInColumn, updateTask } from '../services/taskService';
import type { BulkReorderTasksBody, CreateTaskBody, TaskColumnParams, TaskIdParams, UpdateTaskBody } from '../validators/task';

export async function getTasksByColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { columnId } = req.params as TaskColumnParams;

  try {
    const tasks = await listTasksInColumn(req.authUser.id, columnId);
    res.status(200).json(tasks);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as TaskIdParams;

  try {
    const task = await getTaskById(req.authUser.id, id);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function postTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const task = await createTask(req.authUser.id, req.body as CreateTaskBody);
    res.status(201).json(task);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function putTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as TaskIdParams;

  if (Object.keys(req.body as Record<string, unknown>).length === 0) {
    res.status(400).json({ message: 'At least one field must be provided' });
    return;
  }

  try {
    const task = await updateTask(req.authUser.id, id, req.body as UpdateTaskBody);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function deleteTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { id } = req.params as TaskIdParams;

  try {
    await deleteTask(req.authUser.id, id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function patchTaskReorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const tasks = await bulkReorderTasks(req.authUser.id, req.body as BulkReorderTasksBody);
    res.status(200).json(tasks);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
