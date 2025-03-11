// app/api/admin/orders/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updateOrder } from '@next-app/src/services/orders/updateOrder';
import { getOrderById } from '@next-app/src/services/orders/getOrderById';
import { deleteOrder } from '@next-app/src/services/orders/deleteOrder';
import { CreateOrderDTO } from '@next-app/src/dto/orders/order.dto';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';

import { Params } from '@next-app/src/interface/interface';
import { processNotification } from '@next-app/src/services/notifications/notifications';

const logError = debug('app:api:orders-admin:error');
const log = debug('app:orders-admin');

// Роли, которые могут управлять заказами
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// PUT: Обновление заказа
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const { uuid } = params;
    log(`Attempting to update order with UUID: ${uuid}`);

    if (!uuid) {
      log('Order UUID is missing');
      return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
    }

    // Аутентификация запроса
    const jwtPayload = await authenticateRequest(req, allowedRoles);
    const userId = jwtPayload.uuid;

    let data: CreateOrderDTO;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    try {
      // Получаем данные заказа до обновления
      const { order: existingOrder } = await getOrderById(uuid);

      // Обновляем заказ
      const updatedOrder = await updateOrder(uuid, data);

      // Отправляем уведомления
      try {
        await processNotification({
          createdById: updatedOrder.clientById,
          orderId: updatedOrder.uuid,
          templateKey: 'clientCorpOrderAssigned',
          clientId: updatedOrder.clientById,
          driverId: updatedOrder.assignedDriverId,
          markNotificationAsRead: false,
        });

        // Уведомление водителю, если он назначен
        if (data.assignedDriverId) {
          await processNotification({
            createdById: updatedOrder.assignedDriverId!,
            orderId: updatedOrder.uuid,
            templateKey: 'driverOrderAssigned',
            clientId: updatedOrder.clientById,
            driverId: updatedOrder.assignedDriverId,
            markNotificationAsRead: false,
          });
        }
      } catch (notifyErr) {
        logError('× Ошибка при отправке уведомления (не критично для обновления заказа)');
      }

      // Обновляем задачи в очереди
      const departureTimestamp = new Date(updatedOrder.departureTime).getTime();
      const now = Date.now();
      const delay = departureTimestamp - now - 60_000;

      // Удаляем старые задачи
      const job1 = await orderQueue.getJob(`notification-${uuid}`);
      if (job1) await job1.remove();
      const job2 = await orderQueue.getJob(`checkoverdue-${uuid}`);
      if (job2) await job2.remove();

      // Планируем новые задачи
      if (delay <= 0) {
        console.log(
          `⚠️ DepartureTime (${updatedOrder.departureTime}) уже меньше минуты или прошло, отправляем notification мгновенно`,
        );
        await orderQueue.add(
          'notification',
          { orderUuid: updatedOrder.uuid },
          {
            delay: 0,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            jobId: `notification-${updatedOrder.uuid}`,
          },
        );
        await orderQueue.add(
          'checkoverdue',
          { orderUuid: updatedOrder.uuid },
          {
            delay: 60_000,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            jobId: `checkoverdue-${updatedOrder.uuid}`,
          },
        );
      } else {
        console.log(
          `⏱ Задача "notification" для заказа ${updatedOrder.uuid} запланирована через ${delay} мс`,
        );
        await orderQueue.add(
          'notification',
          { orderUuid: updatedOrder.uuid },
          {
            delay: Math.max(delay, 0),
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            jobId: `notification-${updatedOrder.uuid}`,
          },
        );
        await orderQueue.add(
          'checkoverdue',
          { orderUuid: updatedOrder.uuid },
          {
            delay: delay + 60_000,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            jobId: `checkoverdue-${updatedOrder.uuid}`,
          },
        );
      }

      return NextResponse.json(updatedOrder, { status: 200 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Order UUID is required') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Order not found') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
        if (
          [
            'Client not found',
            'Tariff not found',
            'Departure point not found',
            'Arrival point not found',
            'Driver not found',
            'Not all services found for tariff',
          ].includes(serviceError.message)
        ) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении заказа (500)');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to update order' },
      { status: 500 },
    );
  }
}

// DELETE: Удаление заказа
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const { uuid } = params;
    log(`Attempting to delete order with UUID: ${uuid}`);

    if (!uuid) {
      log('Order UUID is missing');
      return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
    }

    // Аутентификация запроса
    const jwtPayload = await authenticateRequest(req, allowedRoles);
    const userId = jwtPayload.uuid;
    log('Аутентификация пройдена, Admin:', userId);

    try {
      // Получаем данные заказа до удаления
      const orderInfo = await deleteOrder(uuid);

      if (!orderInfo) {
        return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
      }

      // Отправляем уведомления до удаления
      try {
        log('Sending deletion notifications');

        // Уведомление админу
        await processNotification({
          createdById: userId,
          orderId: uuid,
          templateKey: 'adminOrderCreated',
          clientId: orderInfo.clientById,
          driverId: orderInfo.assignedDriverId,
          markNotificationAsRead: false,
        });
        log('Notification sent to admin');

        // Уведомление клиенту
        await processNotification({
          createdById: userId,
          orderId: uuid,
          templateKey: 'adminOrderCreated',
          clientId: orderInfo.clientById,
          driverId: orderInfo.assignedDriverId,
          markNotificationAsRead: false,
        });
        log('Notification sent to client');

        // Уведомление водителю, если он был назначен
        if (orderInfo.assignedDriverId) {
          await processNotification({
            createdById: userId,
            orderId: uuid,
            templateKey: 'driverOrderAssigned',
            clientId: orderInfo.clientById,
            driverId: orderInfo.assignedDriverId,
          });
          log('Notification sent to driver');
        }
      } catch (notifyError) {
        log('Error sending notifications (non-critical):', notifyError);
      }

      // Удаляем связанные задачи из очереди
      const job1 = await orderQueue.getJob(`notification-${uuid}`);
      if (job1) await job1.remove();
      const job2 = await orderQueue.getJob(`checkoverdue-${uuid}`);
      if (job2) await job2.remove();
      log(`Tasks with jobIds notification-${uuid} and checkoverdue-${uuid} removed from queue`);

      return NextResponse.json(
        { status: 'success', message: 'Order deleted successfully' },
        { status: 200 },
      );
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Order UUID is required') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Order not found') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при удалении заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to delete order' },
      { status: 500 },
    );
  }
}
