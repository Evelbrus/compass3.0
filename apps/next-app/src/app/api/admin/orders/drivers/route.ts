// app/api/drivers/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { ServiceLevels, UserRole, VehicleType } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetDriversRequestDTO } from '@next-app/src/dto/users/driver.dto';
import { getDrivers } from '@next-app/src/services/users/getDrivers';

const logError = debug('app:api:drivers:error');

const allowedRoles = [UserRole.Operator, UserRole.Admin];

// GET: Получение списка водителей или одного водителя с фильтрацией
export async function GET(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const parsedParams = parseParams<GetDriversRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { page: 1, per_page: 10 },
    });

    // Валидация параметров запроса
    const errors: string[] = [];
    if (
      parsedParams.serviceLevel &&
      !Object.values(ServiceLevels).includes(parsedParams.serviceLevel)
    ) {
      errors.push(
        `Invalid serviceLevel. Allowed values: ${Object.values(ServiceLevels).join(', ')}`,
      );
    }

    if (
      parsedParams.vehicleType &&
      !Object.values(VehicleType).includes(parsedParams.vehicleType)
    ) {
      errors.push(`Invalid vehicleType. Allowed values: ${Object.values(VehicleType).join(', ')}`);
    }

    if (errors.length > 0) {
      logError('× Ошибки валидации', errors);
      return NextResponse.json(
        { status: 'error', message: 'Validation errors', errors },
        { status: 400 },
      );
    }

    try {
      const result = await getDrivers(parsedParams);
      const serverTime = new Date().toISOString();

      // Если запрошен конкретный водитель
      if (result.singleDriver) {
        return NextResponse.json({
          status: 'success',
          message: 'Driver fetched successfully',
          data: {
            driver: result.singleDriver,
            serverTime,
          },
        });
      }

      // Если запрошен список водителей
      return NextResponse.json({
        status: 'success',
        message: 'Drivers fetched successfully',
        data: {
          page: parsedParams.page,
          perPage: parsedParams.per_page,
          total: result.total || 0,
          filters: result.filters,
          drivers: result.drivers || [],
          serverTime,
        },
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Driver not found') {
          return NextResponse.json(
            { status: 'error', message: 'Driver not found' },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении водителей');
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
