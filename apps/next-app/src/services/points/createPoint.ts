// app/src/services/points/createPoint.ts
import { Point } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { CreatePointDTO } from '@next-app/src/dto/points/point.dto';

const logError = debug('app:services:points:error');

export async function createPoint(data: CreatePointDTO): Promise<Point> {
  try {
    const { address, pricePerKm, terrainDifficulty, latitude, longitude, airport = false } = data;

    if (
      !address ||
      pricePerKm === undefined ||
      terrainDifficulty === undefined ||
      !latitude ||
      !longitude
    ) {
      logError('× Отсутствуют обязательные поля при создании точки');
      throw new Error(
        'Адрес, цена за километр, коэффициент сложности, широта и долгота обязательны',
      );
    }

    const now = new Date();
    const uuid = uuidv4();

    const point = {
      uuid,
      address,
      pricePerKm: Number(pricePerKm),
      terrainDifficulty: Number(terrainDifficulty),
      airport: airport || false,
      latitude: Number(latitude),
      longitude: Number(longitude),
      createdAt: now,
      updatedAt: now,
    };

    return prisma.point.create({ data: point });
  } catch (error) {
    logError('× Ошибка при создании точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
