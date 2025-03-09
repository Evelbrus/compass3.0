// app/src/services/drivers/getDrivers.ts
import { ServiceLevels, UserRole, VehicleType } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { DriverResponseDTO, GetDriversRequestDTO } from '@next-app/src/dto/users/driver.dto';

const logError = debug('app:services:drivers:error');

// Результат сервисной функции может быть либо списком, либо одним водителем
export type GetDriversResult = {
  singleDriver?: DriverResponseDTO;
  drivers?: DriverResponseDTO[];
  total?: number;
  filters?: {
    serviceLevel?: ServiceLevels;
    vehicleType?: VehicleType;
    search?: string;
  };
};

export async function getDrivers(
  parsedParams: ReturnType<typeof parseParams<GetDriversRequestDTO>>,
): Promise<GetDriversResult> {
  try {
    const { page, per_page, serviceLevel, vehicleType, search, assignedDriverId } = parsedParams;

    // Базовые условия фильтрации
    const whereClause: any = {
      role: UserRole.Driver,
      ...(assignedDriverId && { uuid: assignedDriverId }),
      vehicleDriver: {
        is: {
          vehicle: {
            ...(serviceLevel && { serviceLevels: serviceLevel }),
            ...(vehicleType && { vehicleType: vehicleType }),
          },
        },
      },
    };

    // Добавляем условие поиска по ФИО и номеру автомобиля, если указан search
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            {
              vehicleDriver: {
                is: {
                  vehicle: {
                    plateNumber: { contains: search, mode: 'insensitive' as const },
                  },
                },
              },
            },
          ],
        },
      ];
    }

    // Если указан assignedDriverId, ищем одного водителя
    if (assignedDriverId) {
      const driver = await prisma.user.findUnique({
        where: { uuid: assignedDriverId },
        select: {
          uuid: true,
          fullName: true,
          phone: true,
          profilePhotoPath: true,
          lastActive: true,
          vehicleDriver: {
            select: {
              vehicle: {
                select: {
                  vehicleType: true,
                  serviceLevels: true,
                  plateNumber: true,
                },
              },
            },
          },
        },
      });

      if (!driver) {
        logError(`× Водитель с UUID ${assignedDriverId} не найден`);
        throw new Error('Driver not found');
      }

      return { singleDriver: driver as DriverResponseDTO };
    }

    // Получаем список водителей с пагинацией
    const [totalDrivers, drivers] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        select: {
          uuid: true,
          fullName: true,
          phone: true,
          profilePhotoPath: true,
          lastActive: true,
          vehicleDriver: {
            select: {
              vehicle: {
                select: {
                  vehicleType: true,
                  serviceLevels: true,
                  plateNumber: true,
                },
              },
            },
          },
        },
        orderBy: { lastActive: 'desc' },
        skip: (page - 1) * per_page,
        take: per_page,
      }),
    ]);

    return {
      drivers: drivers as DriverResponseDTO[],
      total: totalDrivers,
      filters: {
        ...(serviceLevel && { serviceLevel }),
        ...(vehicleType && { vehicleType }),
        ...(search && { search }),
      },
    };
  } catch (error) {
    logError('× Ошибка при получении водителей');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
