import { User } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:user-get:error');

// Получение пользователя по UUID
export async function getUser(uuid: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { uuid },
    });
  } catch (error) {
    logError('× Ошибка при получении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
