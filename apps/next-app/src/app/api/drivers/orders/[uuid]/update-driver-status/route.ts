// app/api/drivers/orders/[uuid]/update-driver-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';

import { Params } from '@next-app/src/interface/interface';
import {
  UpdateDriverOrderStatusDTO,
  updateDriverOrderStatusService,
} from '@next-app/src/services/orders/managment/driver-order-service';

import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';

const logError = debug('app:api:orders:update-driver-status:error');

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;

  try {
    // Authenticate the request and retrieve user information from JWT token
    const jwtPayload = await authenticateRequest(req, [
      UserRole.Driver,
      UserRole.Admin,
      UserRole.Operator,
    ]);
    const userId = jwtPayload.uuid;

    let data: Omit<UpdateDriverOrderStatusDTO, 'createdById'>;
    try {
      data = await req.json();
    } catch (error) {
      logError('Error parsing JSON request body');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    // Add the authenticated user's ID from JWT token to the request data
    const completeData: UpdateDriverOrderStatusDTO = {
      ...data,
      createdById: userId,
    };

    console.log('completeData', completeData)

    try {
      const result = await updateDriverOrderStatusService(uuid, completeData);
      return NextResponse.json(result, { status: 200 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message.startsWith('Отсутствуют обязательные поля')) {
          logError(`Validation error: ${serviceError.message}`);
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Заказ не найден') {
          logError(`Order not found: ${uuid}`);
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
        if (
          [
            'Водитель не найден или не имеет роли Driver',
            'Водитель занят другими активными заказами',
            'Не удалось зафиксировать изменения заказа в базе данных',
          ].some((msg) => serviceError.message.includes(msg))
        ) {
          logError(`Business logic error: ${serviceError.message}`);
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      logError('Unauthorized access attempt');
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Internal server error: ${errorMessage}`);
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
