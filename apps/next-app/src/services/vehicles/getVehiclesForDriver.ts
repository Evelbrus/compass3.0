// app/src/services/vehicles/getVehiclesForDriver.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import {
  GetVehiclesRequestDTO,
  VehicleResponseDTO,
  VehicleTypeCount,
} from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:services:vehicles:error');

interface GetVehiclesResult {
  vehicles: VehicleResponseDTO[];
  total: number;
  totalAllVehicles: number;
  vehicleTypeCounts: VehicleTypeCount[];
}

export async function getVehiclesForDriver(
  driverUuid: string,
  parsedParams: ReturnType<typeof parseParams<GetVehiclesRequestDTO>>,
): Promise<GetVehiclesResult> {
  try {
    const driverWhere = { vehicleDrivers: { some: { driverId: driverUuid } } };
    const whereFilter = {
      AND: [driverWhere, parsedParams.vehicleType ? { vehicleType: parsedParams.vehicleType } : {}],
    };

    const [vehicles, total, totalAllVehicles, vehicleTypeCounts] = await Promise.all([
      prisma.vehicle.findMany({
        skip: (parsedParams.page - 1) * parsedParams.per_page,
        take: parsedParams.per_page,
        where: whereFilter,
        orderBy: { [parsedParams.sort_by || 'createdAt']: parsedParams.sort_order || 'asc' },
        select: {
          uuid: true,
          vehicleType: true,
          brand: true,
          model: true,
          year: true,
          color: true,
          plateNumber: true,
          isAvailable: true,
          photoPath: true,
          serviceLevels: true,
          createdAt: true,
          updatedAt: true,
          vehicleDrivers: {
            select: {
              driver: {
                select: {
                  uuid: true,
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      prisma.vehicle.count({ where: whereFilter }),
      prisma.vehicle.count({ where: driverWhere }),
      prisma.vehicle.groupBy({
        by: ['vehicleType'],
        _count: { vehicleType: true },
        where: driverWhere,
      }),
    ]);

    // Формируем дополнительное поле drivers для удобства
    const response = vehicles.map((vehicle) => ({
      ...vehicle,
      drivers: vehicle.vehicleDrivers.map((vd) => ({
        userUuid: vd.driver.uuid,
        fullName: vd.driver.fullName,
        phone: vd.driver.phone,
      })),
    }));

    const typeCounts = vehicleTypeCounts.map(({ vehicleType, _count }) => ({
      type: vehicleType,
      count: _count.vehicleType,
    }));

    return {
      vehicles: response as VehicleResponseDTO[],
      total,
      totalAllVehicles,
      vehicleTypeCounts: typeCounts,
    };
  } catch (error) {
    logError('× Ошибка при получении автомобилей для водителя');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
