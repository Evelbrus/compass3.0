import { NextResponse } from 'next/server';
import { PrismaClient, ServiceLevels, Vehicle, VehicleDriver, VehicleType } from '@prisma/client';
import debug from 'debug';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:vehicles');
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    vehicleType: (searchParams.get('vehicleType') as VehicleType | 'all' | null) || null,
    serviceLevel: searchParams.get('serviceLevel') as ServiceLevels | null,
    color: searchParams.get('color') || null,
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
    const where: {
      vehicleType?: VehicleType;
      serviceLevels?: ServiceLevels;
      color?: string;
      isAvailable?: boolean;
    } = {};
    if (parsedParams.vehicleType && parsedParams.vehicleType !== 'all') {
      where.vehicleType = parsedParams.vehicleType;
    }
    if (parsedParams.serviceLevel) {
      where.serviceLevels = parsedParams.serviceLevel;
    }
    if (parsedParams.color) {
      where.color = parsedParams.color;
    }
    if (parsedParams.availability) {
      where.isAvailable = parsedParams.availability === 'true';
    }

    const vehicles = await prisma.vehicle.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by === 'fullName'
          ? 'vehicleDrivers.driver.user.fullName'
          : parsedParams.sort_by === 'serviceType'
            ? 'serviceLevels'
            : parsedParams.sort_by]: parsedParams.sort_order,
      },
      include: {
        vehicleDrivers: {
          include: {
            driver: {
              select: {
                uuid: true,
                status: true,
                user: {
                  select: {
                    uuid: true,
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const total = await prisma.vehicle.count({ where });
    const totalAllVehicles = await prisma.vehicle.count();

    const vehicleTypeCounts = await prisma.vehicle.groupBy({
      by: ['vehicleType'],
      _count: {
        vehicleType: true,
      },
    });

    log('Fetched vehicles:', vehicles);

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
      drivers: vehicle.vehicleDrivers.map((vehicleDriver: any) => ({
        driverProfileUuid: vehicleDriver.driver?.uuid || null,
        userUuid: vehicleDriver.driver?.user?.uuid || null,
        fullName: vehicleDriver.driver?.user?.fullName || null,
        phone: vehicleDriver.driver?.user?.phone || null,
        status: vehicleDriver.driver?.status || null,
      })),
      serviceLevels: vehicle.serviceLevels,
    }));

    return NextResponse.json({
      status: 'success',
      message: 'Fetched vehicles successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllVehicles,
        vehicleTypeCounts,
        vehicles: response,
      },
    });
  } catch (error) {
    log('Error fetching vehicles:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch vehicles', data: null },
      { status: 500 },
    );
  } finally {
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
    driverIds,
    serviceLevels,
  } = data;

  log('Received data:', data);

  //Валидация входных данных
  if (
    !vehicleType ||
    !brand ||
    !model ||
    !year ||
    !color ||
    !plateNumber ||
    !serviceLevels ||
    serviceLevels.length === 0
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const now = new Date();
    const uuid = uuidv4();

    const vehicle = {
      uuid,
      vehicleType,
      brand,
      model,
      year,
      color,
      plateNumber,
      isAvailable,
      photoPath,
      serviceLevels,
      createdAt: now,
      updatedAt: now,
    };

    let createdVehicle: Vehicle | null = null;
    let createdVehicleDrivers: VehicleDriver[] = [];

    await prisma.$transaction(async (transaction) => {
      //Проверка на существование уникального plateNumber
      const existingVehicle = await transaction.vehicle.findUnique({
        where: { plateNumber },
      });

      if (existingVehicle) {
        throw new Error(`Vehicle with plate number ${plateNumber} already exists`);
      }

      createdVehicle = await transaction.vehicle.create({
        data: vehicle,
      });

      if (!createdVehicle) {
        throw new Error('Vehicle creation failed');
      }

      if (driverIds && driverIds.length > 0) {
        for (const driverId of driverIds) {
          const driverExists = await transaction.driverProfile.findUnique({
            where: { uuid: driverId },
          });

          if (!driverExists) {
            throw new Error(`Driver with ID ${driverId} does not exist`);
          }

          //Проверим, существует ли уже запись с таким driverId
          const existingVehicleDriver = await transaction.vehicleDriver.findUnique({
            where: { driverId },
          });

          if (existingVehicleDriver) {
            throw new Error(
              `Driver with ID ${driverId} is already assigned to vehicle with ID ${existingVehicleDriver.vehicleId}`,
            );
          }

          const createdVehicleDriver = await transaction.vehicleDriver.create({
            data: {
              uuid: uuidv4(),
              vehicleId: createdVehicle.uuid,
              driverId,
              assignmentDate: now,
            },
          });

          createdVehicleDrivers.push(createdVehicleDriver);
        }
      }
    });

    log('Created vehicle:', createdVehicle);

    return NextResponse.json({
      status: 'success',
      message: 'Vehicle created successfully',
      vehicle: createdVehicle,
      vehicleDrivers: createdVehicleDrivers,
    });
  } catch (error) {
    log('Error creating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
    }
    return NextResponse.json({ status: 'error', message: 'Unknown error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
