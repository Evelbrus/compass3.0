// app/api/admin/vehicles/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';

import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { getVehicleById } from '@next-app/src/services/vehicles/getVehicleById';
import { updateVehicle } from '@next-app/src/services/vehicles/updateVehicle';
import { deleteVehicle } from '@next-app/src/services/vehicles/deleteVehicle';
import { UpdateVehicleDTO } from '@next-app/src/dto/vehicles/vehicle.dto';
import { Params } from '@next-app/src/interface/interface';
import { patchVehicle } from '@next-app/src/services/vehicles/patchVehicle';

const logError = debug('app:api:vehicles-admin:error');

// Роли, которые могут управлять автомобилями
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// GET: Получение автомобиля по uuid
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = params;

    try {
      const vehicle = await getVehicleById(uuid);

      return NextResponse.json({
        status: 'success',
        data: vehicle,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Vehicle not found') {
          return NextResponse.json(
            { status: 'error', message: 'Vehicle not found' },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении автомобиля');
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

// PUT: Обновление автомобиля по uuid
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = params;
    const data: UpdateVehicleDTO = await req.json();

    try {
      const result = await updateVehicle(uuid, data);

      return NextResponse.json({
        status: 'success',
        uuid: result.uuid,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Missing required parameter: uuid') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message.startsWith('Автомобиль с номером')) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message.startsWith('Водитель уже привязан')) {
          const cause = serviceError.cause as { fullName?: string } | undefined;
          return NextResponse.json(
            { error: { message: serviceError.message, fullName: cause?.fullName } },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to update vehicle' },
      { status: 500 },
    );
  }
}

// PATCH: Частичное обновление автомобиля (например, photoPath)
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    await authenticateRequest(req, allowedRoles);
    const { uuid } = params;
    const data = await req.json();

    const result = await patchVehicle(uuid, data);

    return NextResponse.json({
      status: 'success',
      message: 'Vehicle updated successfully',
      uuid: result.uuid,
    });
  } catch (error) {
    logError('× Ошибка при частичном обновлении автомобиля:', error);
    if (error instanceof Error) {
      if (error.message === 'Missing required parameter: uuid') {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
      }
      if (error.message === 'Vehicle not found') {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to patch vehicle' },
      { status: 500 },
    );
  }
}

// DELETE: Удаление автомобиля по uuid
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = params;

    try {
      const result = await deleteVehicle(uuid);

      return NextResponse.json({
        status: 'success',
        data: { uuid: result.uuid },
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Missing required parameter: uuid') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при удалении автомобиля');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to delete vehicle' },
      { status: 500 },
    );
  }
}
