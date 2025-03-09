// app/src/services/tariffs/getTariffs.ts
import { VehicleType, ServiceLevels } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetTariffsRequestDTO, TariffResponseDTO } from '@next-app/src/dto/tariffs/tariff.dto';

const logError = debug('app:services:tariffs:error');

interface GetTariffsResult {
  tariffs: TariffResponseDTO[];
  total: number;
  totalAllTariffs: number;
}

export async function getTariffs(
  parsedParams: ReturnType<typeof parseParams<GetTariffsRequestDTO>>,
): Promise<GetTariffsResult> {
  try {
    // Формируем условие выборки
    const where: {
      vehicleType?: VehicleType;
      serviceLevel?: ServiceLevels;
    } = {};

    if (parsedParams.vehicleType) {
      where.vehicleType = parsedParams.vehicleType;
    }
    if (parsedParams.serviceLevel) {
      where.serviceLevel = parsedParams.serviceLevel;
    }

    const tariffs = await prisma.tariff.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
      include: {
        tariffAdditionalServices: {
          include: {
            service: true,
          },
        },
      },
    });

    const total = await prisma.tariff.count({ where });
    const totalAllTariffs = await prisma.tariff.count();

    // Преобразуем ответ
    const response = tariffs.map((tariff) => ({
      ...tariff,
      tariffAdditionalServices: tariff.tariffAdditionalServices.map((service) => ({
        ...service,
        name: service.service.name,
        price: service.price,
      })),
    })) as TariffResponseDTO[];

    return { tariffs: response, total, totalAllTariffs };
  } catch (error) {
    logError('× Ошибка при получении тарифов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
