// app/api/driver/vehicles/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';

import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { getVehiclesForDriver } from '@next-app/src/services/vehicles/getVehiclesForDriver';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetVehiclesRequestDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:api:vehicles-driver:error');

// GET: Получение списка автомобилей (для водителей)
export async function GET(req: NextRequest) {
  try {
    // Аутентификация запроса
    const jwtPayload = await authenticateRequest(req, [UserRole.Driver]);

    if (!jwtPayload.uuid) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const parsedParams = parseParams<GetVehiclesRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'asc' },
      allowedSortFields: ['brand', 'model', 'vehicleType', 'createdAt', 'updatedAt'],
    });

    try {
      const { vehicles, total, totalAllVehicles, vehicleTypeCounts } = await getVehiclesForDriver(
        jwtPayload.uuid,
        parsedParams,
      );

      return NextResponse.json({
        status: 'success',
        message: 'Fetched vehicles successfully',
        data: {
          page: parsedParams.page,
          per_page: parsedParams.per_page,
          total,
          totalAllVehicles,
          vehicleTypeCounts,
          vehicles,
        },
      });
    } catch (serviceError) {
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении списка автомобилей для водителя');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
