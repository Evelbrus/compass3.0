// app/api/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { OrderStatus, UserRole, Action } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createOrder } from '@next-app/src/services/orders/createOrder';
import { getOrders } from '@next-app/src/services/orders/getOrders';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { CreateOrderDTO, GetOrdersRequestDTO } from '@next-app/src/dto/orders/order.dto';
import { processBulkNotifications, processNotification } from '@next-app/src/utils/notifications/notifications';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { prisma } from '@shared/prisma/prisma-client';

const logError = debug('app:api:orders:error');

// Роли, которые могут создавать заказы
const allowedRoles = [UserRole.Admin, UserRole.Operator, UserRole.Client, UserRole.ClientCorp];

// GET: Получение списка заказов с фильтрацией и пагинацией
export async function GET(req: NextRequest) {
  try {
    // Аутентификация запроса
     await authenticateRequest(req);

    const parsedParams = parseParams<GetOrdersRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'desc' },
      allowedSortFields: ['createdAt', 'updatedAt', 'finalPrice', 'departureTime'],
    });

    try {
      const { orders, total, totalAllOrders, statusesCount } = await getOrders(parsedParams);

      return NextResponse.json({
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllOrders,
        statusesCount,
        orders,
      });
    } catch (serviceError) {
      throw serviceError;
    }
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

// POST: Создание нового заказа
export async function POST(req: NextRequest) {
  try {
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

    // Определяем статус заказа
    const orderStatus = data.assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

    try {
      // Создаем заказ
      const createdOrder = await createOrder(data, orderStatus);

      // Отправляем уведомления
      try {
        // Уведомление создателю
        await processNotification({
          userId: userId,
          orderId: createdOrder.uuid,
          action: Action.info,
          templateKey: 'orderCreatedByCorpClientToClient',
          createdById: userId,
        });

        // Уведомление администраторам и операторам
        const adminsAndOperators = await prisma.user.findMany({
          where: { role: { in: [UserRole.Admin, UserRole.Operator] } },
        });

        if (adminsAndOperators.length > 0) {
          await processBulkNotifications({
            users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
            orderId: createdOrder.uuid,
            action: Action.info,
            templateKey: 'orderCreatedByCorpClientToAdmins',
            createdById: userId,
          });
        }

        // Уведомление водителю, если он назначен
        if (data.assignedDriverId) {
          await processNotification({
            userId: data.assignedDriverId,
            orderId: createdOrder.uuid,
            action: Action.info,
            templateKey: 'orderCreatedWithDriver',
            createdById: userId,
            driverById: data.assignedDriverId,
          });
        }
      } catch (notifyErr) {
        logError('× Ошибка при отправке уведомления (не критично для создания заказа)');
      }

      // Планируем задачи в очереди
      const departureTimestamp = new Date(createdOrder.departureTime).getTime();
      const now = Date.now();
      const delay = departureTimestamp - now - 60_000; // За минуту до отправления

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
            delay: Math.max(delay, 0),
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
        if (
          serviceError.message === 'Client not found' ||
          serviceError.message === 'Tariff not found' ||
          serviceError.message === 'Departure point not found' ||
          serviceError.message === 'Arrival point not found' ||
          serviceError.message === 'Driver not found' ||
          serviceError.message === 'Not all services found for tariff'
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
    logError('× Ошибка при создании заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to create order' },
      { status: 500 },
    );
  }
}
