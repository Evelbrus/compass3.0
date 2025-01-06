import { NextResponse } from 'next/server';
import { PrismaClient, VehicleType, Color } from '@prisma/client';
import debug from 'debug';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:vehicles');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    vehicleType: searchParams.get('vehicleType') as VehicleType | null,
    color: searchParams.get('color') as Color | null,
    availability: searchParams.get('availability') as 'true' | 'false' | null,
    sort_by:
      (searchParams.get('sort_by') as
        | 'brand'
        | 'model'
        | 'year'
        | 'color'
        | 'createdAt'
        | 'updatedAt'
        | 'isAvailable'
        | 'fullName'
        | 'serviceType') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    //Создаем объект "where" для условий фильтрации
    const where: { vehicleType?: VehicleType; color?: Color; isAvailable?: boolean } = {};
    if (parsedParams.vehicleType) {
      where.vehicleType = parsedParams.vehicleType;
    }
    if (parsedParams.color) {
      where.color = parsedParams.color;
    }
    if (parsedParams.availability) {
      where.isAvailable = parsedParams.availability === 'true';
    }

    //Выполняем запрос к базе данных для получения списка машин
    const vehicles = await prisma.vehicle.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by === 'fullName'
          ? 'vehicleDrivers.driver.user.fullName'
          : parsedParams.sort_by === 'serviceType'
            ? 'service_levels.service.serviceType'
            : parsedParams.sort_by]: parsedParams.sort_order,
      },
      include: {
        vehicleDrivers: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        service_levels: {
          include: {
            service: {
              select: {
                name: true,
                serviceType: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.vehicle.count({ where });
    const totalAllVehicles = await prisma.vehicle.count();

    log('Fetched vehicles:', vehicles);

    //Формируем ответ с данными о машинах, водителях и уровнях обслуживания
    const response = vehicles.map((vehicle) => ({
      uuid: vehicle.uuid,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plateNumber: vehicle.plateNumber,
      isAvailable: vehicle.isAvailable,
      photoPath: vehicle.photoPath,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      drivers: vehicle.vehicleDrivers.map((vehicleDriver) => ({
        fullName: vehicleDriver.driver?.user?.fullName || null,
        phone: vehicleDriver.driver?.user?.phone || null,
      })),
      serviceLevels: vehicle.service_levels.map((serviceLevel) => ({
        name: serviceLevel.service.name,
        serviceType: serviceLevel.service.serviceType,
      })),
    }));

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      totalAllVehicles,
      vehicles: response,
    });
  } catch (error) {
    log('Error fetching vehicles:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch vehicles' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

export async function POST(req: Request) {
  const data: CreateVehicleData = await req.json();
  const {
    vehicleType,
    brand,
    model,
    year,
    color,
    plateNumber,
    isAvailable,
    photoPath,
    driverId,
    serviceLevelId,
  } = data;

  //Валидация входных данных
  if (!vehicleType || !brand || !model || !year || !color || !plateNumber || !serviceLevelId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    //Генерация текущей даты
    const now = new Date();

    //Используем транзакцию для создания автомобиля и связанных записей
    const result = await prisma.$transaction(async (prisma) => {
      //Создаем новый автомобиль
      const newVehicle = await prisma.vehicle.create({
        data: {
          vehicleType,
          brand,
          model,
          year: new Date(year),
          color,
          plateNumber,
          isAvailable: isAvailable ?? true,
          photoPath,
        },
      });

      //Логирование нового автомобиля
      log('New vehicle created:', newVehicle);

      if (driverId) {
        //Проверяем наличие водителя
        const driverExists = await prisma.driverProfile.findUnique({
          where: { uuid: driverId },
        });

        if (!driverExists) {
          throw new Error(`Driver with ID ${driverId} does not exist`);
        }

        //Логирование перед созданием записи в таблице vehicleDriver
        log('Creating VehicleDriver with vehicleId:', newVehicle.uuid, 'and driverId:', driverId);

        //Создаем запись в таблице vehicleDriver с уникальным UUID
        await prisma.vehicleDriver.create({
          data: {
            uuid: uuidv4(),
            vehicleId: newVehicle.uuid,
            driverId,
            assignmentDate: now,
          },
        });

        log('VehicleDriver created with vehicleId:', newVehicle.uuid, 'and driverId:', driverId);
      }

      //Создаем запись в таблице vehicle_on_service_levels с уникальным UUID
      await prisma.vehicle_on_service_levels.create({
        data: {
          uuid: uuidv4(),
          vehicleUuid: newVehicle.uuid,
          serviceUuid: serviceLevelId,
        },
      });

      log(
        'VehicleOnServiceLevels created with vehicleUuid:',
        newVehicle.uuid,
        'and serviceUuid:',
        serviceLevelId,
      );

      return newVehicle;
    });

    log('Created new vehicle:', result);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create vehicle' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
