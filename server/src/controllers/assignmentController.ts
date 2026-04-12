import type { NextFunction, Request, Response } from 'express';
import { AssignmentError, assignUserToTask, listAssignableUsers, unassignUserFromTask } from '../services/assignmentService';
import type { AssignmentBody, AssignmentUsersQuery } from '../validators/assignment';

export async function getAssignableUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId } = req.query as AssignmentUsersQuery;

  try {
    const users = await listAssignableUsers(req.authUser.id, taskId);
    res.status(200).json(users);
  } catch (error: unknown) {
    if (error instanceof AssignmentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function postTaskAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId, userId } = req.body as AssignmentBody;

  try {
    const task = await assignUserToTask(req.authUser.id, taskId, userId);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof AssignmentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function deleteTaskAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId, userId } = req.body as AssignmentBody;

  try {
    const task = await unassignUserFromTask(req.authUser.id, taskId, userId);
    res.status(200).json(task);
  } catch (error: unknown) {
    if (error instanceof AssignmentError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
