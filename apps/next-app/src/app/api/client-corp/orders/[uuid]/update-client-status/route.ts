// app/api/clients/orders/[uuid]/update-client-status/route.ts
import { NextResponse } from 'next/server';
import debug from 'debug';
import { updateOrderStatus } from '@next-app/src/services/orders/updateOrderStatus';
import { UpdateOrderStatusDTO } from '@next-app/src/dto/orders/order-status.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:orders:update-client-status:error');
const log = debug('app:orders:update-client-status');

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Обновление статуса для заказа UUID: ${uuid} клиентом`);

  try {
    let data: UpdateOrderStatusDTO;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    log(`Полученные данные:`, {
      driverStatus: data.driverStatus ?? 'null',
      orderStatus: data.orderStatus ?? 'null',
      userId: data.userId,
      createdById: data.createdById,
      notificationUuid: data.notificationUuid,
      driverById: data.driverById ?? 'null',
      action: data.action,
      markNotificationAsRead: data.markNotificationAsRead ?? 'null',
    });

    try {
      const result = await updateOrderStatus(uuid, data);
      log(`Заказ ${uuid} успешно обновлён клиентом:`, result);
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
    log('Ошибка при обновлении статуса заказа клиентом:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
