// app/src/services/points/updatePoint.ts
import { Point } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UpdatePointDTO } from '@next-app/src/dto/points/point.dto';

const logError = debug('app:services:points:error');

export async function updatePoint(uuid: string, data: UpdatePointDTO): Promise<Point> {
  try {
    const { address, pricePerKm, terrainDifficulty, latitude, longitude } = data;

    if (
      !address ||
      pricePerKm === undefined ||
      terrainDifficulty === undefined ||
      !latitude ||
      !longitude
    ) {
      logError('× Отсутствуют обязательные поля при обновлении точки');
      throw new Error('Все поля обязательны');
    }

    return prisma.point.update({
      where: { uuid },
      data: {
        address,
        pricePerKm: Number(pricePerKm),
        terrainDifficulty: Number(terrainDifficulty),
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logError('× Ошибка при обновлении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
