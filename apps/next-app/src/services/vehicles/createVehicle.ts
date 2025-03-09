// app/src/services/vehicles/createVehicle.ts
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { CreateVehicleDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:services:vehicles:error');

export async function createVehicle(data: CreateVehicleDTO): Promise<{ uuid: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const newVehicleUuid = uuidv4();
      const yearDate = data.year ? new Date(data.year.toString()) : undefined;

      // Проверка на существование номера автомобиля
      const existingVehicle = await tx.vehicle.findUnique({
        where: { plateNumber: data.plateNumber },
      });

      if (existingVehicle) {
        logError(`× Автомобиль с номером ${data.plateNumber} уже существует`);
        throw new Error(`Автомобиль с номером ${data.plateNumber} уже существует`);
      }

      // Создаём автомобиль
      const createdVehicle = await tx.vehicle.create({
        data: {
          uuid: newVehicleUuid,
          vehicleType: data.vehicleType,
          brand: data.brand,
          model: data.model,
          year: yearDate,
          color: data.color,
          plateNumber: data.plateNumber,
          isAvailable: data.isAvailable,
          photoPath: data.photoPath,
          serviceLevels: data.serviceLevels,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Извлекаем идентификаторы водителей
      let driverIds: string[] = [];
      if (data.vehicleDrivers && data.vehicleDrivers.length > 0) {
        driverIds = data.vehicleDrivers.map((assignment) => assignment.driver.uuid);
      } else if (data.driverIds && data.driverIds.length > 0) {
        driverIds = data.driverIds;
      }

      if (driverIds.length > 0) {
        // Проверяем, чтобы водитель не был привязан к другому автомобилю
        for (const driverId of driverIds) {
          const existingAssignment = await tx.vehicleDriver.findFirst({
            where: { driverId },
            include: { driver: true },
          });
          if (existingAssignment) {
            const driver = await tx.user.findUnique({ where: { uuid: driverId } });
            if (driver) {
              logError(`× Водитель ${driver.fullName} уже привязан к другому автомобилю`);
              throw new Error(`Водитель уже привязан к другому автомобилю.`, {
                cause: { fullName: driver.fullName },
              });
            }
          }
        }

        await tx.vehicleDriver.createMany({
          data: driverIds.map((driverId) => ({
            vehicleId: newVehicleUuid,
            driverId,
            assignmentDate: now,
          })),
        });
      }

      return { uuid: createdVehicle.uuid };
    });

    return result;
  } catch (error) {
    logError('× Ошибка при создании автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
