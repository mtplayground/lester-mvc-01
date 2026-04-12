import type { Request, Response } from 'express';
import { getHealthStatus } from '../services/healthService';
import { HealthStatusSchema } from '../validators';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const health = HealthStatusSchema.parse(await getHealthStatus());

  if (health.status === 'ok') {
    res.status(200).json(health);
    return;
  }

  res.status(503).json(health);
}
