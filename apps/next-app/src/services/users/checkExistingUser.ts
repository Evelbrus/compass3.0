// app/api/admin/users/checkExistingUser.ts
import { User } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';

export async function checkExistingUser(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}
