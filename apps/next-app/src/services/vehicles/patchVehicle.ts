import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { PatchVehicleDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:vehicles-service:error');

export async function patchVehicle(uuid: string, data: PatchVehicleDTO) {
  const { photoPath } = data;
  const now = new Date();

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { uuid } });
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const vehicleUpdates: any = { updatedAt: now };
    if (photoPath) {
      vehicleUpdates.photoPath = photoPath;
    }

    return await prisma.vehicle.update({
      where: { uuid },
      data: vehicleUpdates,
    });
  } catch (error) {
    logError('× Ошибка при частичном обновлении автомобиля:', error);
    throw error;
  }
}
