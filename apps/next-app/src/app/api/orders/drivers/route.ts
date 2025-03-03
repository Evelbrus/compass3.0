import { NextResponse } from 'next/server';
import { VehicleType, ServiceLevels, UserRole } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const logError = debug('app:api:drivers:error');

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Парсинг параметров
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);
    const serviceLevel = searchParams.get('serviceLevel');
    const vehicleType = searchParams.get('vehicleType');
    const search = searchParams.get('search');
    const assignedDriverId = searchParams.get('assignedDriverId');

    // Валидация
    const errors: string[] = [];
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
      logError('Ошибки валидации (400)', errors);
      return NextResponse.json(
        { status: 'error', message: 'Validation errors', errors },
        { status: 400 },
      );
    }

    // Базовые условия фильтрации
    const whereClause: any = {
      role: UserRole.Driver,
      ...(assignedDriverId && { uuid: assignedDriverId }),
      vehicleDriver: {
        is: {
          vehicle: {
            ...(serviceLevel && { serviceLevels: serviceLevel as ServiceLevels }),
            ...(vehicleType && { vehicleType: vehicleType as VehicleType }),
          },
        },
      },
    };

    // Добавляем условие поиска по ФИО и номеру автомобиля, если указан search
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            {
              vehicleDriver: {
                is: {
                  vehicle: {
                    plateNumber: { contains: search, mode: 'insensitive' as const },
                  },
                },
              },
            },
          ],
        },
      ];
    }

    // Если указан assignedDriverId, ищем одного водителя
    if (assignedDriverId) {
      const driver = await prisma.user.findUnique({
        where: { uuid: assignedDriverId },
        select: {
          uuid: true,
          fullName: true,
          phone: true,
          profilePhotoPath: true,
          lastActive: true,
          vehicleDriver: {
            select: {
              vehicle: {
                select: {
                  vehicleType: true,
                  serviceLevels: true,
                  plateNumber: true,
                },
              },
            },
          },
        },
      });

      if (!driver) {
        logError(`Водитель не найден (assignedDriverId=${assignedDriverId}) (404)`);
        return NextResponse.json({ status: 'error', message: 'Driver not found' }, { status: 404 });
      }

      // Возвращаем водителя с вложенной структурой vehicleDriver
      return NextResponse.json({
        status: 'success',
        data: {
          driver,
          serverTime: new Date().toISOString(),
        },
      });
    }

    // Получаем список водителей с пагинацией
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
            select: {
              vehicle: {
                select: {
                  vehicleType: true,
                  serviceLevels: true,
                  plateNumber: true,
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

    // Возвращаем список водителей с вложенной структурой vehicleDriver
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
        drivers,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError('Ошибка при получении списка (500)');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
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
