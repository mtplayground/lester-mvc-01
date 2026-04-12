import 'dotenv/config';
import app from './app';
import { verifyDatabaseConnection } from './lib/prisma';

const port = Number(process.env.PORT ?? 3000);

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
