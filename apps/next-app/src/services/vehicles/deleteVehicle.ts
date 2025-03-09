// app/src/services/vehicles/deleteVehicle.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:vehicles:error');

export async function deleteVehicle(uuid: string): Promise<{ uuid: string }> {
  try {
    if (!uuid) {
      logError('× Отсутствует UUID автомобиля');
      throw new Error('Missing required parameter: uuid');
    }

    const deletedVehicle = await prisma.vehicle.delete({
      where: { uuid },
    });

    return { uuid: deletedVehicle.uuid };
  } catch (error) {
    logError('× Ошибка при удалении автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
