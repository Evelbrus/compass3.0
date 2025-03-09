// app/src/services/vehicles/updateVehicleAvailability.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UpdateVehicleAvailabilityDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:services:vehicles:error');

export async function updateVehicleAvailability(
  data: UpdateVehicleAvailabilityDTO,
): Promise<{ uuid: string; isAvailable: boolean }> {
  try {
    const { uuid, isAvailable } = data;

    if (!uuid || typeof isAvailable !== 'boolean') {
      logError('× Неверные данные для обновления доступности');
      throw new Error('Invalid data');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { uuid },
      data: { isAvailable },
    });

    return {
      uuid: updatedVehicle.uuid,
      isAvailable: updatedVehicle.isAvailable,
    };
  } catch (error) {
    logError('× Ошибка при обновлении доступности автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
