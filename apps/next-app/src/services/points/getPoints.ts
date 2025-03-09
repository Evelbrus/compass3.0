// app/src/services/points/getPoints.ts
import { Point, Prisma } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetPointsRequestDTO } from '@next-app/src/dto/points/point.dto';

const logError = debug('app:services:points:error');

interface GetPointsResult {
  points: Point[];
  total: number;
}

export async function getPoints(
  parsedParams: ReturnType<typeof parseParams<GetPointsRequestDTO>>,
): Promise<GetPointsResult> {
  try {
    const { search, page, per_page, sort_by, sort_order } = parsedParams;

    // Фильтрация по адресу
    const where: Prisma.PointWhereInput = search
      ? { address: { contains: search, mode: 'insensitive' } }
      : {};

    // Валидация и создание сортировки
    const validSortFields = [
      'address',
      'pricePerKm',
      'createdAt',
      'updatedAt',
      'terrainDifficulty',
    ];
    const orderBy: Prisma.PointOrderByWithRelationInput[] = [];

    if (sort_by && validSortFields.includes(sort_by)) {
      orderBy.push({ [sort_by]: sort_order ?? 'asc' } as Prisma.PointOrderByWithRelationInput);
    } else {
      orderBy.push({ createdAt: 'asc' });
    }

    // Доп. сортировка по UUID для стабильности
    orderBy.push({ uuid: 'asc' });

    const [points, total] = await Promise.all([
      prisma.point.findMany({
        where,
        orderBy: orderBy.length ? orderBy : undefined,
        skip: (page - 1) * per_page,
        take: per_page,
        select: {
          uuid: true,
          address: true,
          pricePerKm: true,
          terrainDifficulty: true,
          airport: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.point.count({ where }),
    ]);

    return { points, total };
  } catch (error) {
    logError('× Ошибка при получении точек');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
