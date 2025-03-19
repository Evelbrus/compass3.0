import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createVehicle } from '@next-app/src/services/vehicles/createVehicle';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { getVehiclesForAdmin } from '@next-app/src/services/vehicles/getVehiclesForAdmin';
import { CreateVehicleDTO, GetVehiclesRequestDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:api:vehicles-admin:error');

const allowedRoles = [UserRole.Admin, UserRole.Operator];

// GET: Получение списка всех автомобилей
export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req, allowedRoles);

    const parsedParams = parseParams<GetVehiclesRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'asc' },
      allowedSortFields: ['brand', 'model', 'vehicleType', 'createdAt', 'updatedAt'],
    });

    const { vehicles, total, totalAllVehicles, vehicleTypeCounts } =
      await getVehiclesForAdmin(parsedParams);

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
  } catch (error) {
    logError('× Ошибка при получении списка автомобилей');
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

// POST: Создание нового автомобиля
export async function POST(req: NextRequest) {
  try {
    await authenticateRequest(req, allowedRoles);
    const data: CreateVehicleDTO = await req.json();
    const result = await createVehicle(data);

    return NextResponse.json({
      status: 'success',
      uuid: result.uuid,
    });
  } catch (error) {
    logError('× Ошибка при создании автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);

      if (error.message.startsWith('Автомобиль с номером')) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
      }
      if (error.message.startsWith('Водитель уже привязан')) {
        const cause = error.cause as { fullName?: string } | undefined;
        return NextResponse.json(
          { error: { message: error.message, fullName: cause?.fullName } },
          { status: 400 },
        );
      }
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to create vehicle' },
      { status: 500 },
    );
  }
}
