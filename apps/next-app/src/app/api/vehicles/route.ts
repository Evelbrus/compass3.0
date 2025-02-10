import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ServiceLevels, VehicleType } from '@prisma/client';
import debug from 'debug';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';

const log = debug('app:vehicles');

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
  try {
    const data: CreateVehicleData = await req.json();
    const updateData: CreateVehicleData = data;

    const result = await prisma.$transaction(async (prisma) => {
      const now = new Date();
      const uuid = uuidv4();
      const yearDate = updateData.year ? new Date(updateData.year.toString()) : undefined;

      //Проверка на существование номера автомобиля
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { plateNumber: updateData.plateNumber },
      });

      if (existingVehicle) {
        throw new Error(`Автомобиль с номером ${updateData.plateNumber} уже существует`);
      }

      const createdVehicle = await prisma.vehicle.create({
        data: {
          uuid,
          vehicleType: updateData.vehicleType,
          brand: updateData.brand,
          model: updateData.model,
          year: yearDate,
          color: updateData.color,
          plateNumber: updateData.plateNumber,
          isAvailable: updateData.isAvailable,
          photoPath: updateData.photoPath,
          serviceLevels: updateData.serviceLevels,
          createdAt: now,
          updatedAt: now,
        },
      });

      log('Created vehicle:', createdVehicle);

      if (updateData.driverIds) {
        if (updateData.driverIds.length > 0) {
          for (const driverId of updateData.driverIds) {
            const existingAssignment = await prisma.vehicleDriver.findFirst({
              where: {
                driverId: driverId,
              },
              include: {
                driver: true,
              },
            });

            if (existingAssignment) {
              const driver = await prisma.user.findUnique({
                where: {
                  uuid: driverId,
                },
              });
              if (driver) {
                throw new Error(`Водитель уже привязан к другому автомобилю.`, {
                  cause: { fullName: driver.fullName },
                });
              }
            }
          }

          await prisma.vehicleDriver.createMany({
            data: updateData.driverIds.map((driverId) => ({
              vehicleId: uuid,
              driverId: driverId,
              assignmentDate: now,
            })),
          });
        }
      }

      return { uuid: createdVehicle.uuid };
    });

    log('Created vehicle with details:', result);
    return NextResponse.json({ status: 'success', uuid: result.uuid }, { status: 200 });
  } catch (error) {
    log('Error creating vehicle:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
      if (error.message.startsWith('Водитель уже привязан')) {
        const cause = error.cause as { fullName?: string } | undefined;
        return NextResponse.json(
          {
            error: {
              message: error.message,
              fullName: cause?.fullName,
            },
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error: {
            message: error.message,
          },
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Unable to create vehicle' }, { status: 500 });
  }
}
