// app/api/client-corp/orders/[uuid]/update-client-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';

import { Params } from '@next-app/src/interface/interface';
import {
  UpdateClientOrderStatusDTO,
  updateClientOrderStatusService,
} from '@next-app/src/services/orders/managment/client-order-service';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';

const logError = debug('app:api:orders:update-client-status:error');

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;

  try {
    // Authenticate the request and retrieve user information from JWT token
    const jwtPayload = await authenticateRequest(req, [
      UserRole.Client,
      UserRole.ClientCorp,
      UserRole.Admin,
      UserRole.Operator,
    ]);
    const userId = jwtPayload.uuid;

    let data: Omit<UpdateClientOrderStatusDTO, 'createdById'>;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    // Add the authenticated user's ID from JWT token to the request data
    const completeData: UpdateClientOrderStatusDTO = {
      ...data,
      createdById: userId,
    };

    console.log('completeData', completeData);

    try {
      const result = await updateClientOrderStatusService(uuid, completeData);
      return NextResponse.json(result, { status: 200 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message.startsWith('Отсутствуют обязательные поля')) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Заказ не найден') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
        if (serviceError.message === 'Клиент не найден или не является создателем заказа') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 403 },
          );
        }
        if (
          [
            'Не удалось зафиксировать изменения заказа в базе данных',
            'Уведомление не найдено',
          ].some((msg) => serviceError.message.includes(msg))
        ) {
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
