// app/src/services/vehicles/getVehicleById.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { VehicleResponseDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:services:vehicles:error');

export async function getVehicleById(uuid: string): Promise<VehicleResponseDTO> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { uuid },
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
    });

    if (!vehicle) {
      logError(`× Автомобиль с UUID ${uuid} не найден`);
      throw new Error('Vehicle not found');
    }

    // Формируем поле drivers для удобства
    const response = {
      ...vehicle,
      drivers: vehicle.vehicleDrivers.map((vd) => ({
        userUuid: vd.driver.uuid,
        fullName: vd.driver.fullName,
        phone: vd.driver.phone,
      })),
    } as VehicleResponseDTO;

    return response;
  } catch (error) {
    logError('× Ошибка при получении автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
