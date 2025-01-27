import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ServiceLevels, Vehicle, VehicleDriver, VehicleType } from '@prisma/client';
import debug from 'debug';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { v4 as uuidv4 } from 'uuid';
<<<<<<< HEAD
import { getToken } from 'next-auth/jwt';
import { NextApiRequest } from 'next';
=======
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:vehicles');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
<<<<<<< HEAD
  const token = await getToken({ req: req as unknown as NextApiRequest });

  if (!token?.uuid) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }
=======
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5

  const parsedParams = {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    per_page: Math.max(1, Math.min(100, parseInt(searchParams.get('per_page') || '10'))),
    vehicleType: searchParams.get('vehicleType') as VehicleType | null,
    serviceLevel: searchParams.get('serviceLevel') as ServiceLevels | null,
    color: searchParams.get('color'),
    availability:
      searchParams.get('availability') === 'true'
        ? true
        : searchParams.get('availability') === 'false'
          ? false
          : null,
    sortBy: searchParams.get('sort_by') || 'createdAt',
    sortOrder: (searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc') as Prisma.SortOrder,
  };

  try {
    const driverWhere = { vehicleDrivers: { some: { driverId: token.uuid } } };
    const whereFilter =
      token.role === 'Driver'
        ? {
            AND: [
              driverWhere,
              parsedParams.vehicleType ? { vehicleType: parsedParams.vehicleType } : {},
            ],
          }
        : {
            vehicleType: parsedParams.vehicleType || undefined,
            serviceLevels: parsedParams.serviceLevel || undefined,
            color: parsedParams.color || undefined,
            isAvailable: parsedParams.availability !== null ? parsedParams.availability : undefined,
          };

<<<<<<< HEAD
=======
    const whereFilter = {
      vehicleType: parsedParams.vehicleType || undefined,
      serviceLevels: parsedParams.serviceLevel || undefined,
      color: parsedParams.color || undefined,
      isAvailable: parsedParams.availability !== null ? parsedParams.availability : undefined,
    };

>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
    const [vehicles, total, totalAllVehicles, vehicleTypeCounts] = await Promise.all([
      prisma.vehicle.findMany({
        skip: (parsedParams.page - 1) * parsedParams.per_page,
        take: parsedParams.per_page,
        where: whereFilter,
        orderBy: { [parsedParams.sortBy]: parsedParams.sortOrder },
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
                  driverProfile: { select: { status: true } },
                },
              },
            },
          },
        },
      }),
      prisma.vehicle.count({ where: whereFilter }),
      token.role === 'Driver'
        ? prisma.vehicle.count({ where: driverWhere })
        : prisma.vehicle.count(),
<<<<<<< HEAD
=======
      prisma.vehicle.count(),
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
      prisma.vehicle.groupBy({
        by: ['vehicleType'],
        _count: { vehicleType: true },
        where: token.role === 'Driver' ? driverWhere : {},
<<<<<<< HEAD
=======
        where: {},
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
      }),
    ]);

    const response = vehicles.map((vehicle) => ({
      ...vehicle,
      drivers: vehicle.vehicleDrivers.map((vd) => ({
        userUuid: vd.driver.uuid,
        fullName: vd.driver.fullName,
        phone: vd.driver.phone,
        status: vd.driver.driverProfile?.status,
      })),
    }));

    const typeCounts = vehicleTypeCounts.map(({ vehicleType, _count }) => ({
      type: vehicleType,
      count: _count.vehicleType,
    }));

    return NextResponse.json({
      status: 'success',
      message: 'Fetched vehicles successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllVehicles,
        vehicleTypeCounts: typeCounts,
        vehicles: response,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
<<<<<<< HEAD
  const token = await getToken({ req: req as unknown as NextApiRequest });

  //Authorization check for Admin role
  if (token?.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

  //Enhanced validation
  if (
    !vehicleType ||
    !brand ||
    !model ||
    typeof year !== 'number' ||
    year < 1900 ||
    year > new Date().getFullYear() + 1 ||
    !color ||
    !plateNumber ||
    !serviceLevels ||
    serviceLevels.length === 0
  ) {
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }

=======
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
  try {
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
      driverIds = [],
      serviceLevels = [],
    } = data;

    log('Received vehicle creation request:', data);

    //Расширенная валидация
    const validationErrors = [];

    //Проверка обязательных полей
    if (!vehicleType) validationErrors.push('Vehicle type is required');
    if (!brand) validationErrors.push('Brand is required');
    if (!model) validationErrors.push('Model is required');
    if (!color) validationErrors.push('Color is required');
    if (!plateNumber) validationErrors.push('Plate number is required');

    //Валидация года
    if (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 1) {
      validationErrors.push('Invalid year');
    }

    //Валидация serviceLevels
    if (!Array.isArray(serviceLevels) || serviceLevels.length === 0) {
      validationErrors.push('At least one service level is required');
    } else {
      const validLevels = Object.values(ServiceLevels);
      const invalidLevels = serviceLevels.filter((level) => !validLevels.includes(level));
      if (invalidLevels.length > 0) {
        validationErrors.push(`Invalid service levels: ${invalidLevels.join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 },
      );
    }

    const now = new Date();
    const uuid = uuidv4();

    //Проверка уникальности номерного знака
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: `Vehicle with plate number ${plateNumber} already exists` },
        { status: 409 },
      );
    }

    let createdVehicle: Vehicle;
    let createdVehicleDrivers: VehicleDriver[] = [];

    await prisma.$transaction(async (transaction) => {
<<<<<<< HEAD
      //Check for existing plate number
      const existingVehicle = await transaction.vehicle.findUnique({
        where: { plateNumber },
      });

      if (existingVehicle) {
        throw new Error(`Vehicle with plate number ${plateNumber} already exists`);
      }

      //Create vehicle
=======
      //Создание транспортного средства
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
      createdVehicle = await transaction.vehicle.create({
        data: {
          uuid,
          vehicleType,
          brand,
          model,
          year,
          color,
          plateNumber,
          isAvailable,
          photoPath: photoPath || '',
          serviceLevels,
          createdAt: now,
          updatedAt: now,
        },
      });

      //Проверка существующих назначений водителей
      if (driverIds.length > 0) {
        const existingDrivers = await transaction.vehicleDriver.findMany({
          where: { driverId: { in: driverIds } },
        });

<<<<<<< HEAD
      //Batch check for existing driver assignments
      if (driverIds && driverIds.length > 0) {
        const existingDrivers = await transaction.vehicleDriver.findMany({
          where: { driverId: { in: driverIds } },
        });

=======
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
        if (existingDrivers.length > 0) {
          const conflictIds = existingDrivers.map((d) => d.driverId);
          throw new Error(`Drivers already assigned: ${conflictIds.join(', ')}`);
        }

<<<<<<< HEAD
        //Create driver associations
        createdVehicleDrivers = await Promise.all(
          driverIds.map(async (driverId) => {
            const driverUser = await transaction.user.findUnique({
=======
        //Создание связей с водителями
        createdVehicleDrivers = await Promise.all(
          driverIds.map(async (driverId) => {
            //Проверка существования водителя
            const driver = await transaction.user.findUnique({
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
              where: { uuid: driverId, role: 'Driver' },
              include: { driverProfile: true },
            });

<<<<<<< HEAD
            if (!driverUser?.driverProfile) {
              throw new Error(`Driver ${driverId} not found`);
=======
            if (!driver?.driverProfile) {
              throw new Error(`Driver ${driverId} not found or not a valid driver`);
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
            }

            return transaction.vehicleDriver.create({
              data: {
                uuid: uuidv4(),
<<<<<<< HEAD
                vehicleId: createdVehicle!.uuid,
                driverId,
                assignmentDate: now,
=======
                vehicleId: uuid,
                driverId,
                assignmentDate: now,
                createdAt: now,
                updatedAt: now,
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
              },
            });
          }),
        );
      }
    });

<<<<<<< HEAD
    log('Created vehicle:', createdVehicle);
    return NextResponse.json({
      status: 'success',
      message: 'Vehicle created successfully',
      vehicle: createdVehicle,
      vehicleDrivers: createdVehicleDrivers,
    });
  } catch (error) {
    log('Error creating vehicle:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
=======
    log('Successfully created vehicle:', createdVehicle);
    return NextResponse.json(
      {
        status: 'success',
        message: 'Vehicle created successfully',
        data: {
          vehicle: createdVehicle,
          drivers: createdVehicleDrivers,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    log('Vehicle creation error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
>>>>>>> e182d403429aec1a1aa86b387b5740cc86771ca5
    );
  }
}
