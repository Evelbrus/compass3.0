import { Prisma } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:user-delete:error');

// Удаление пользователя
export async function deleteUser(uuid: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { uuid },
    });
  } catch (error) {
    logError('× Ошибка при удалении пользователя:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        logError('Foreign key constraint failed on the field:', error.meta?.field_name);
        throw new Error('Foreign key constraint violation. Check related records.');
      }
    }

    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }

    throw error;
  }
}
