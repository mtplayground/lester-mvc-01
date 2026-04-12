import { execSync } from 'node:child_process';
import { prisma } from '../lib/prisma';

let migrationsApplied = false;

async function resetDatabase(): Promise<void> {
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(async () => {
  if (!migrationsApplied) {
    execSync('npx prisma migrate deploy --schema prisma/schema.prisma', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      }
    });

    migrationsApplied = true;
  }

  await prisma.$connect();
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
