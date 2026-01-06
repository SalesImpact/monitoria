import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserOrganizations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    return [];
  }

  return [user.organization];
}

export async function hasMultipleOrganizations(userId: string): Promise<boolean> {
  const organizations = await getUserOrganizations(userId);
  return organizations.length > 1;
}

