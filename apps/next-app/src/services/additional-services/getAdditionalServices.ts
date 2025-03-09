// app/src/services/additional-services/getAdditionalServices.ts
import { AdditionalService } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetAdditionalServicesRequestDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const logError = debug('app:services:additional-service:error');

interface GetAdditionalServicesResult {
  additionalServices: AdditionalService[];
  total: number;
}

export async function getAdditionalServices(
  parsedParams: ReturnType<typeof parseParams<GetAdditionalServicesRequestDTO>>,
): Promise<GetAdditionalServicesResult> {
  try {
    // Формируем условия для поиска
    const where: { name?: { contains: string; mode: 'insensitive' } } = {};
    if (parsedParams.search) {
      where.name = { contains: parsedParams.search, mode: 'insensitive' };
    }

    // Запросы к БД
    const additionalServices = await prisma.additionalService.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
    });

    const total = await prisma.additionalService.count({ where });

    return { additionalServices, total };
  } catch (error) {
    logError('× Ошибка при получении списка услуг');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
