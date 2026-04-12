import type { Request, Response } from 'express';
import { getHealthStatus } from '../services/healthService';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const health = await getHealthStatus();

  if (health.status === 'ok') {
    res.status(200).json(health);
    return;
  }

  res.status(503).json(health);
}
