import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import debug from 'debug';
import { EditVehicleData } from '@shared/prisma/interface/vehicles/interface';

const log = debug('app:vehicles');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

//Интерфейс для параметров запроса
interface Params {
  uuid: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uuid = searchParams.get('uuid');

  //Валидация входного параметра
  if (!uuid) {
    return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
  }

  try {
    //Получение данных автомобиля по UUID
    const vehicle = await prisma.vehicle.findUnique({
      where: { uuid },
      include: {
        vehicleDrivers: {
          include: {
            driver: true,
          },
        },
      },
    });

    //Проверка, найден ли автомобиль
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    log('Fetched vehicle:', vehicle);
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    log('Error fetching vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch vehicle' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { uuid } = data as Params;
  const updateData: EditVehicleData = data;

  //Валидация входного параметра
  if (!uuid) {
    return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
  }

  try {
    //Используем транзакцию для обновления автомобиля и связанных записей
    const result = await prisma.$transaction(async (prisma) => {
      //Обновляем данные автомобиля
      const updatedVehicle = await prisma.vehicle.update({
        where: { uuid },
        data: {
          vehicleType: updateData.vehicleType,
          brand: updateData.brand,
          model: updateData.model,
          year: updateData.year ? new Date(updateData.year) : undefined,
          color: updateData.color,
          plateNumber: updateData.plateNumber,
          isAvailable: updateData.isAvailable,
          photoPath: updateData.photoPath,
          serviceLevels: updateData.serviceLevels,
        },
      });

      log('Updated vehicle:', updatedVehicle);

      //Обновляем связанных водителей
      if (updateData.driverIds) {
        //Удаляем старые записи о водителях
        await prisma.vehicleDriver.deleteMany({ where: { vehicleId: uuid } });
        //Создаем новые записи о водителях
        await prisma.vehicleDriver.createMany({
          data: updateData.driverIds.map((driverId) => ({
            vehicleId: uuid,
            driverId: driverId,
            assignmentDate: new Date(),
          })),
        });
      }

      return updatedVehicle;
    });

    log('Updated vehicle with details:', result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    log('Error updating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update vehicle' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const uuid = searchParams.get('uuid');

  //Валидация входного параметра
  if (!uuid) {
    return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
  }

  try {
    //Удаление автомобиля по UUID
    await prisma.vehicle.delete({
      where: { uuid },
    });

    log('Deleted vehicle with uuid:', uuid);
    return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });
  } catch (error) {
    log('Error deleting vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to delete vehicle' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
