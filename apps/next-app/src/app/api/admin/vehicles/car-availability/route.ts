// app/api/vehicles/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updateVehicleAvailability } from '@next-app/src/services/vehicles/updateVehicleAvailability';
import { UpdateVehicleAvailabilityDTO } from '@next-app/src/dto/vehicles/vehicle.dto';

const logError = debug('app:api:vehicles:error');

// Роли, которые могут обновлять доступность автомобилей
const allowedRoles = [UserRole.Admin, UserRole.Operator, UserRole.Driver];

// PATCH: Обновление доступности автомобиля
export async function PATCH(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const data: UpdateVehicleAvailabilityDTO = await req.json();

    try {
      const result = await updateVehicleAvailability(data);

      return NextResponse.json({
        status: 'success',
        message: 'Availability updated successfully',
        data: {
          uuid: result.uuid,
          isAvailable: result.isAvailable,
        },
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Invalid data') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении доступности автомобиля');
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
