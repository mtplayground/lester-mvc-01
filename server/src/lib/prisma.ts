import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function verifyDatabaseConnection(): Promise<void> {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
}

if (process.argv[1] && process.argv[1].includes('prisma.ts')) {
  verifyDatabaseConnection()
    .then(async () => {
      console.log('Database connection verified');
      await prisma.$disconnect();
    })
    .catch(async (error: unknown) => {
      console.error('Database connection failed');
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
