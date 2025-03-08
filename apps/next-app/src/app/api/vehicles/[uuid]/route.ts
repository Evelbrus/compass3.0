import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { VehicleData } from '@features/vehicles/hooks/create/useVehiclesCreateForm';
import { authenticateRequest, JwtPayload } from '@next-app/src/utils/authenticate/authenticateRequest';
import { Params } from '@next-app/src/interface/interface';

const log = debug('app:vehicles:uuid');

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { uuid } = await params;

    // Проверяем токен с помощью authenticateRequest
    const token: JwtPayload = await authenticateRequest(req);

    // Запрос данных автомобиля по UUID
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

    // Если автомобиль не найден
    if (!vehicle) {
      return NextResponse.json({ status: 'error', message: 'Vehicle not found' }, { status: 404 });
    }

    // Формируем поле drivers для удобства
    const response = {
      ...vehicle,
      drivers: vehicle.vehicleDrivers.map((vd) => ({
        userUuid: vd.driver.uuid,
        fullName: vd.driver.fullName,
        phone: vd.driver.phone,
      })),
    };

    // Успешный ответ
    return NextResponse.json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    // Если ошибка связана с аутентификацией, возвращаем 401
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    // Для остальных ошибок возвращаем 500
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT эндпоинт: обновление данных автомобиля.
 * Из тела запроса извлекается либо поле driverIds (массив строк), либо vehicleDrivers (массив объектов с вложенным driver),
 * из которых извлекаются идентификаторы водителей. Затем обновляются данные автомобиля и связи в таблице VehicleDriver.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    //Дожидаемся параметров и JSON‑payload
    const { uuid } = await params;
    const data: Partial<VehicleData> & { driverIds?: string[] } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
    }

    //Определяем массив идентификаторов водителей:
    //если пришёл driverIds, используем его, иначе, если пришёл vehicleDrivers – извлекаем driver.uuid
    const driverIds: string[] =
      data.driverIds && data.driverIds.length > 0
        ? data.driverIds
        : data.vehicleDrivers && data.vehicleDrivers.length > 0
          ? data.vehicleDrivers.map((assignment) => assignment.driver.uuid)
          : [];

    //Выполняем транзакцию для обновления автомобиля
    const result = await prisma.$transaction(async (prisma) => {
      //Проверка: нет ли другого автомобиля с таким же номером
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          plateNumber: data.plateNumber,
          NOT: { uuid },
        },
      });
      if (existingVehicle) {
        throw new Error(`Автомобиль с номером ${data.plateNumber} уже существует`);
      }

      //Обновляем основные данные автомобиля
      const updatedVehicle = await prisma.vehicle.update({
        where: { uuid },
        data: {
          vehicleType: data.vehicleType,
          brand: data.brand,
          model: data.model,
          year: data.year ? new Date(data.year) : undefined,
          color: data.color,
          plateNumber: data.plateNumber,
          isAvailable: data.isAvailable,
          photoPath: data.photoPath,
          serviceLevels: data.serviceLevels,
          ownership: data.ownership,
        },
      });
      log('Updated vehicle:', updatedVehicle);

      //Обновляем связи с водителями:
      //Сначала удаляем все существующие связи для данного автомобиля
      await prisma.vehicleDriver.deleteMany({ where: { vehicleId: uuid } });

      if (driverIds.length > 0) {
        //Для каждого переданного идентификатора проверяем, не привязан ли водитель к другому автомобилю
        for (const driverId of driverIds) {
          const existingAssignment = await prisma.vehicleDriver.findFirst({
            where: {
              driverId,
              NOT: { vehicleId: uuid },
            },
            include: { driver: true },
          });
          if (existingAssignment) {
            const driver = await prisma.user.findUnique({ where: { uuid: driverId } });
            if (driver) {
              throw new Error(`Водитель уже привязан к другому автомобилю.`, {
                cause: { fullName: driver.fullName },
              });
            }
          }
        }

        //Создаём новые связи для каждого водителя
        const createResult = await prisma.vehicleDriver.createMany({
          data: driverIds.map((driverId) => ({
            vehicleId: uuid,
            driverId,
            assignmentDate: new Date(),
          })),
        });
        log('Created vehicleDriver records:', createResult);
      }
      //Если driverIds пустой – связи уже удалены

      return { uuid: updatedVehicle.uuid };
    });

    log('Updated vehicle with details:', result);
    return NextResponse.json({ status: 'success', uuid: result.uuid }, { status: 200 });
  } catch (error: unknown) {
    log('Error updating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
      if (error.message.startsWith('Водитель уже привязан')) {
        const cause = error.cause as { fullName?: string } | undefined;
        return NextResponse.json(
          { error: { message: error.message, fullName: cause?.fullName } },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: { message: error.message } }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to update vehicle' }, { status: 500 });
  }
}

/**
 * DELETE эндпоинт: удаление автомобиля.
 * Если в схеме для связи vehicleDrivers указан onDelete: Cascade,
 * то связанные записи будут удалены автоматически.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { uuid } = await params;
    if (!uuid) {
      return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
    }

    const deletedVehicle = await prisma.vehicle.delete({
      where: { uuid },
    });

    log('Deleted vehicle:', deletedVehicle);
    return NextResponse.json({ status: 'success', data: deletedVehicle }, { status: 200 });
  } catch (error: unknown) {
    log('Error deleting vehicle:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to delete vehicle' }, { status: 500 });
  }
}
