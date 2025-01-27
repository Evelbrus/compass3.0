import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ServiceLevels, Vehicle, VehicleDriver, VehicleType } from '@prisma/client';
import debug from 'debug';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { jwtVerify } from 'jose';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';

const log = debug('app:vehicles');

//Функция для верификации JWT
async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  let token;

  if (accessToken) {
    token = await verifyJWT(accessToken, authConfig.accessToken.secret);
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  if (!token?.uuid) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

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
      prisma.vehicle.groupBy({
        by: ['vehicleType'],
        _count: { vehicleType: true },
        where: token.role === 'Driver' ? driverWhere : {},
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

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  let token;

  if (accessToken) {
    token = await verifyJWT(accessToken, authConfig.accessToken.secret);
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  if (!token?.uuid) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  //Authorization check for Admin role
  if (token?.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
      !serviceLevels
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const now = new Date();
    const uuid = uuidv4();
    const yearDate = new Date(year, 0, 1);

    const vehicle = {
      uuid,
      vehicleType,
      brand,
      model,
      year: yearDate,
      color,
      plateNumber,
      isAvailable,
      photoPath,
      serviceLevels: serviceLevels as ServiceLevels,
      createdAt: now,
      updatedAt: now,
    };

    let createdVehicle: Vehicle | null = null;
    let createdVehicleDrivers: VehicleDriver[] = [];

    await prisma.$transaction(async (transaction) => {
      //Check for existing plate number
      const existingVehicle = await transaction.vehicle.findUnique({
        where: { plateNumber },
      });

      if (existingVehicle) {
        throw new Error(`Vehicle with plate number ${plateNumber} already exists`);
      }

      //Create vehicle
      createdVehicle = await transaction.vehicle.create({
        data: vehicle,
      });

      if (!createdVehicle) {
        throw new Error('Vehicle creation failed');
      }

      //Batch check for existing driver assignments
      if (driverIds && driverIds.length > 0) {
        const existingDrivers = await transaction.vehicleDriver.findMany({
          where: { driverId: { in: driverIds } },
        });

        if (existingDrivers.length > 0) {
          const conflictIds = existingDrivers.map((d) => d.driverId);
          throw new Error(`Drivers already assigned: ${conflictIds.join(', ')}`);
        }

        //Create driver associations
        createdVehicleDrivers = await Promise.all(
          driverIds.map(async (driverId) => {
            const driverUser = await transaction.user.findUnique({
              where: { uuid: driverId, role: 'Driver' },
              include: { driverProfile: true },
            });

            if (!driverUser?.driverProfile) {
              throw new Error(`Driver ${driverId} not found`);
            }

            return transaction.vehicleDriver.create({
              data: {
                uuid: uuidv4(),
                vehicleId: createdVehicle!.uuid,
                driverId,
                assignmentDate: now,
              },
            });
          }),
        );
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
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
