import { NextResponse } from 'next/server';
import { VehicleType, ServiceLevels, UserRole } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:api:drivers');

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    //Парсинг параметров запроса
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const serviceLevel = searchParams.get('serviceLevel');
    const vehicleType = searchParams.get('vehicleType');
    const search = searchParams.get('search');
    const assignedDriverId = searchParams.get('assignedDriverId');

    //Валидация параметров запроса
    const errors = [];

    if (isNaN(page) || page < 1) {
      errors.push('Invalid page parameter');
    }

    if (isNaN(perPage) || perPage < 1 || perPage > 100) {
      errors.push('Invalid per_page parameter (1-100)');
    }

    if (serviceLevel && !Object.values(ServiceLevels).includes(serviceLevel as ServiceLevels)) {
      errors.push(
        `Invalid serviceLevel. Allowed values: ${Object.values(ServiceLevels).join(', ')}`,
      );
    }

    if (vehicleType && !Object.values(VehicleType).includes(vehicleType as VehicleType)) {
      errors.push(`Invalid vehicleType. Allowed values: ${Object.values(VehicleType).join(', ')}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { status: 'error', message: 'Validation errors', errors },
        { status: 400 },
      );
    }

    //Формирование условий фильтрации
    const whereClause = {
      role: UserRole.Driver,
      ...(search && {
        fullName: {
          startsWith: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(assignedDriverId && {
        uuid: assignedDriverId,
      }),
      vehicleDriver: {
        is: {
          vehicle: {
            ...(serviceLevel && { serviceLevels: serviceLevel as ServiceLevels }),
            ...(vehicleType && { vehicleType: vehicleType as VehicleType }),
          },
        },
      },
    };

    //Если указан assignedDriverId, ищем только одного водителя
    if (assignedDriverId) {
      const driver = await prisma.user.findUnique({
        where: {
          uuid: assignedDriverId,
        },
        select: {
          uuid: true,
          fullName: true,
          phone: true,
          profilePhotoPath: true,
          lastActive: true,
          vehicleDriver: {
            //Загружаем информацию об автомобиле
            select: {
              vehicle: {
                select: {
                  vehicleType: true,
                  serviceLevels: true,
                },
              },
            },
          },
        },
      });

      if (!driver) {
        return NextResponse.json({ status: 'error', message: 'Driver not found' }, { status: 404 });
      }

      log(`Fetched driver with assignedDriverId: ${assignedDriverId}`);

      return NextResponse.json({
        status: 'success',
        data: {
          driver,
          serverTime: new Date().toISOString(),
        },
      });
    } else {
      //Иначе выполняем старый код с пагинацией
      //Параллельное выполнение запросов
      const [totalDrivers, drivers] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          select: {
            uuid: true,
            fullName: true,
            phone: true,
            profilePhotoPath: true,
            lastActive: true,
            vehicleDriver: {
              //Загружаем информацию об автомобиле
              select: {
                vehicle: {
                  select: {
                    vehicleType: true,
                    serviceLevels: true,
                  },
                },
              },
            },
          },
          orderBy: { lastActive: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
      ]);

      log(`Fetched ${drivers.length} drivers with filters`, {
        serviceLevel,
        vehicleType,
        search,
      });

      return NextResponse.json({
        status: 'success',
        data: {
          page,
          perPage,
          total: totalDrivers,
          filters: {
            ...(serviceLevel && { serviceLevel }),
            ...(vehicleType && { vehicleType }),
            ...(search && { search }),
          },
          drivers: drivers.map((driver) => ({
            ...driver,
            vehicleType: driver.vehicleDriver?.vehicle.vehicleType || null,
            serviceLevels: driver.vehicleDriver?.vehicle.serviceLevels || null,
            uuid: driver.uuid,
          })),
          serverTime: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error fetching drivers:', error);
    log(
      'Error details:',
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : error,
    );

    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
