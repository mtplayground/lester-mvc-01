import type { NextFunction, Request, Response } from 'express';
import { ActivityError, listTaskActivities } from '../services/activityService';
import type { ActivityTaskQuery } from '../validators/activity';

export async function getTaskActivityFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { taskId } = req.query as ActivityTaskQuery;

  try {
    const activities = await listTaskActivities(req.authUser.id, taskId);
    res.status(200).json(activities);
  } catch (error: unknown) {
    if (error instanceof ActivityError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
}
