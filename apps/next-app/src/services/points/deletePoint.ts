// app/src/services/points/deletePoint.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:points:error');

export async function deletePoint(uuid: string): Promise<void> {
  try {
    // Проверяем, существует ли точка
    const existingPoint = await prisma.point.findUnique({
      where: { uuid },
    });

    if (!existingPoint) {
      logError(`× Точка с UUID ${uuid} не найдена`);
      throw new Error('Точка не найдена');
    }

    await prisma.point.delete({
      where: { uuid },
    });
  } catch (error) {
    logError('× Ошибка при удалении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
