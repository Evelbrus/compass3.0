// app/src/services/vehicles/updateVehicle.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UpdateVehicleDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:services:vehicles:error');

export async function updateVehicle(
  uuid: string,
  data: UpdateVehicleDTO,
): Promise<{ uuid: string }> {
  try {
    if (!uuid) {
      logError('× Отсутствует UUID автомобиля');
      throw new Error('Missing required parameter: uuid');
    }

    // Определяем массив идентификаторов водителей
    const driverIds: string[] =
      data.driverIds && data.driverIds.length > 0
        ? data.driverIds
        : data.vehicleDrivers && data.vehicleDrivers.length > 0
          ? data.vehicleDrivers.map((assignment) => assignment.driver.uuid)
          : [];

    // Выполняем транзакцию для обновления автомобиля
    const result = await prisma.$transaction(async (tx) => {
      // Проверка: нет ли другого автомобиля с таким же номером
      if (data.plateNumber) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: {
            plateNumber: data.plateNumber,
            NOT: { uuid },
          },
        });
        if (existingVehicle) {
          logError(`× Автомобиль с номером ${data.plateNumber} уже существует`);
          throw new Error(`Автомобиль с номером ${data.plateNumber} уже существует`);
        }
      }

      // Обновляем основные данные автомобиля
      const updatedVehicle = await tx.vehicle.update({
        where: { uuid },
        data: {
          vehicleType: data.vehicleType,
          brand: data.brand,
          model: data.model,
          year: data.year ? new Date(data.year.toString()) : undefined,
          color: data.color,
          plateNumber: data.plateNumber,
          isAvailable: data.isAvailable,
          photoPath: data.photoPath,
          serviceLevels: data.serviceLevels,
        },
      });

      // Обновляем связи с водителями: сначала удаляем все существующие связи
      await tx.vehicleDriver.deleteMany({ where: { vehicleId: uuid } });

      if (driverIds.length > 0) {
        // Для каждого водителя проверяем, не привязан ли он к другому автомобилю
        for (const driverId of driverIds) {
          const existingAssignment = await tx.vehicleDriver.findFirst({
            where: {
              driverId,
              NOT: { vehicleId: uuid },
            },
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

        // Создаём новые связи для каждого водителя
        await tx.vehicleDriver.createMany({
          data: driverIds.map((driverId) => ({
            vehicleId: uuid,
            driverId,
            assignmentDate: new Date(),
          })),
        });
      }

      return { uuid: updatedVehicle.uuid };
    });

    return result;
  } catch (error) {
    logError('× Ошибка при обновлении автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
