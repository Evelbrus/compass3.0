// app/api/clients/orders/[uuid]/update-client-status/route.ts
import { NextResponse } from 'next/server';
import debug from 'debug';

import { Params } from '@next-app/src/interface/interface';
import {
  UpdateClientOrderStatusDTO,
  updateClientOrderStatusService,
} from '@next-app/src/services/orders/managment/client-order-service';

const logError = debug('app:api:orders:update-client-status:error');

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;

  try {
    let data: UpdateClientOrderStatusDTO;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    try {
      const result = await updateClientOrderStatusService(uuid, data);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
