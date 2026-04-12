import 'dotenv/config';
import express from 'express';
import { prisma, verifyDatabaseConnection } from './lib/prisma';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'database unavailable', error });
  }
});

async function startServer(): Promise<void> {
  try {
    await verifyDatabaseConnection();
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error');
    console.error(error);
    process.exit(1);
  }
}

void startServer();
