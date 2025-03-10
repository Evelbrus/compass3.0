// app/api/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';

import { OrderStatus, UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createOrder } from '@next-app/src/services/orders/createOrder';
import { getOrders } from '@next-app/src/services/orders/getOrders';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { CreateOrderDTO, GetOrdersRequestDTO } from '@next-app/src/dto/orders/order.dto';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { processNotification } from '@next-app/src/services/notifications/notificationService';

const logError = debug('app:api:orders:error');

// Разрешенные роли (только Admin и Operator)
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// GET: Получение списка заказов с фильтрацией и пагинацией
export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req);

    const parsedParams = parseParams<GetOrdersRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'desc' },
      allowedSortFields: ['createdAt', 'updatedAt', 'finalPrice', 'departureTime'],
    });

    const { orders, total, totalAllOrders, statusesCount } = await getOrders(parsedParams);

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      totalAllOrders,
      statusesCount,
      orders,
    });
  } catch (error) {
    logError('× Ошибка при получении списка заказов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch orders' },
      { status: 500 },
    );
  }
}

// POST: Создание нового заказа (только Admin и Operator)
export async function POST(req: NextRequest) {
  try {
    const jwtPayload = await authenticateRequest(req, allowedRoles);
    const userId = jwtPayload.uuid;

    let data: CreateOrderDTO;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    const orderStatus = data.assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

    const createdOrder = await createOrder(data, orderStatus);

    // Отправляем уведомления
    try {
      // Уведомление админу или оператору (создателю заказа)
      await processNotification({
        userId: userId,
        orderId: createdOrder.uuid,
        templateKey: 'orderCreatedByAdminToAdmin',
        clientById: data.clientBy,
        driverById: data.assignedDriverId,
      });

      // Уведомление клиенту, если он указан и отличается от создателя
      if (data.clientBy) {
        await processNotification({
          userId: userId,
          orderId: createdOrder.uuid,
          templateKey: 'orderCreatedByAdminToClient',
          clientById: data.clientBy,
          driverById: data.assignedDriverId,
        });
      }

      // Уведомление водителю, если он назначен
      if (data.assignedDriverId) {
        await processNotification({
          userId: userId,
          orderId: createdOrder.uuid,
          templateKey: 'orderCreatedDriverAssigned',
          clientById: data.clientBy,
          driverById: data.assignedDriverId,
        });
      }
    } catch (notifyErr) {
      logError('× Ошибка при отправке уведомления (не критично для создания заказа)');
      console.error(notifyErr);
    }

    // Планируем задачи в очереди
    const departureTimestamp = new Date(createdOrder.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60_000;

    if (delay <= 0) {
      console.log(
        `⚠️ DepartureTime (${createdOrder.departureTime}) уже меньше минуты или прошло, отправляем notification мгновенно`,
      );
      await orderQueue.add(
        'notification',
        { orderUuid: createdOrder.uuid },
        {
          delay: 0,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${createdOrder.uuid}`,
        },
      );
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: createdOrder.uuid },
        {
          delay: 60_000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${createdOrder.uuid}`,
        },
      );
    } else {
      console.log(
        `⏱ Задача "notification" для заказа ${createdOrder.uuid} запланирована через ${delay} мс`,
      );
      await orderQueue.add(
        'notification',
        { orderUuid: createdOrder.uuid },
        {
          delay: delay,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${createdOrder.uuid}`,
        },
      );
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: createdOrder.uuid },
        {
          delay: delay + 60_000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${createdOrder.uuid}`,
        },
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Order created successfully',
      uuid: createdOrder.uuid,
    });
  } catch (serviceError) {
    if (serviceError instanceof Error) {
      const knownErrors = [
        'Client not found',
        'Tariff not found',
        'Departure point not found',
        'Arrival point not found',
        'Driver not found',
        'Not all services found for tariff',
      ];

      if (knownErrors.includes(serviceError.message)) {
        return NextResponse.json(
          { status: 'error', message: serviceError.message },
          { status: 400 },
        );
      }
    }

    logError('× Ошибка при создании заказа');
    if (serviceError instanceof Error) {
      logError('Error message:', serviceError.message);
      logError('Error stack:', serviceError.stack);
    }

    return NextResponse.json(
      { status: 'error', message: 'Unable to create order' },
      { status: 500 },
    );
  }
}
