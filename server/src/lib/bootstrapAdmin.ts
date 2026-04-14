import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const SALT_ROUNDS = 12;

function getAdminConfig(): { email: string; password: string; name: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || 'Admin User';

  if (!email || !password) {
    return null;
  }

  if (password.length < 8 || password.length > 72) {
    throw new Error('ADMIN_PASSWORD must be between 8 and 72 characters');
  }

  return { email, password, name };
}

export async function ensureAdminUser(): Promise<void> {
  const admin = getAdminConfig();

  if (!admin) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: admin.email }
  });

  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(admin.password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: admin.email,
      passwordHash,
      name: admin.name
    }
  });

  console.log(`Bootstrapped admin user: ${admin.email}`);
}
