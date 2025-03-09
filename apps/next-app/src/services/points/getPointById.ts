// app/src/services/points/getPointById.ts
import { Point } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:points:error');

export async function getPointById(uuid: string): Promise<Point> {
  try {
    const point = await prisma.point.findUnique({
      where: { uuid },
    });

    if (!point) {
      logError(`× Точка с UUID ${uuid} не найдена`);
      throw new Error('Точка не найдена');
    }

    return point;
  } catch (error) {
    logError('× Ошибка при получении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
