import { prisma } from '../lib/prisma';
import type { HealthStatus } from '../models/healthModel';

export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString()
    };
  } catch {
    return {
      status: 'error',
      database: 'down',
      timestamp: new Date().toISOString()
    };
  }
}
