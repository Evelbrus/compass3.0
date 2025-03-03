import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { Action, DriverAcceptanceStatus, Gender, OrderStatus, UserRole } from '@prisma/client';
import {
  authenticateRequest,
  JwtPayload,
} from '@next-app/src/utils/authenticate/authenticateRequest';
import { processNotification } from '@next-app/src/utils/notifications/notifications';

const log = debug('app:orders');

const logError = debug('app:orders:error');

interface Params {
  uuid: string;
}

//GET-запрос: Получение заказа с пагинацией, фильтрацией и сортировкой
export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Fetching order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: true,
        tariff: {
          include: {
            tariffAdditionalServices: {
              include: { service: true },
            },
          },
        },
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: true,
        orderTariffAdditionalServices: {
          include: { tariffOnService: { include: { service: true } } },
        },
      },
    });

    if (!order) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    log('Fetched order:', order);

    const formattedOrderTariffAdditionalServices = order.orderTariffAdditionalServices.map(
      (orderService) => ({
        serviceUuid: orderService.tariffOnService.uuid,
        name: orderService.tariffOnService.service.name,
        price: orderService.tariffOnService.price,
      }),
    );

    const formattedOrder = {
      createdBy: order.createdById,
      assignedDriverId: order.assignedDriverId || null,
      departurePoint: order.departurePoint.uuid,
      arrivalPoint: order.arrivalPoint.uuid,
      intermediatePoints: order.intermediatePoints,
      tariff: {
        ...order.tariff,
        tariffAdditionalServices: order.tariff.tariffAdditionalServices,
      },
      description: order.description,
      status: order.status,
      flightNumber: order.flightNumber,
      waitingTimeMinutes: order.waitingTimeMinutes,
      departureTime: order.departureTime,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderTariffAdditionalServices: formattedOrderTariffAdditionalServices,
      basePrice: order.basePrice,
    };

    return NextResponse.json({
      page: 1,
      per_page: 10,
      total: 1,
      totalAllOrders: 1,
      statusesCount: [],
      orders: [formattedOrder],
    });
  } catch (error) {
    log('Error fetching order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch order' }, { status: 500 });
  }
}

//PUT-запрос: Обновление заказа и обновление задачи в очереди
export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Attempting to update order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  let token: JwtPayload;
  const allowedRoles = [UserRole.Operator, UserRole.Admin];
  try {
    token = await authenticateRequest(req, allowedRoles);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminUserId = token.uuid;

  try {
    let data: CreateOrderData;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const {
      tariffUuid,
      departureTime,
      departurePoint,
      arrivalPoint,
      intermediatePoints,
      basePrice,
      selectedServices,
      assignedDriverId,
      description,
      flightNumber,
      waitingTimeMinutes,
      fullName,
      phone,
      status: requestedStatus,
    } = data;

    const corpClientId = data.createdBy;

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        createdById: true,
        assignedDriverId: true,
        status: true,
      },
    });

    if (!existingOrder) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Определяем статус заказа
    const orderStatus = requestedStatus
      ? requestedStatus
      : assignedDriverId
        ? OrderStatus.PLANNED
        : OrderStatus.PENDING;

    // Обновляем заказ в транзакции
    const updatedOrder = await prisma.$transaction(async (prismaTx) => {
      let clientUuid = corpClientId;

      // Обработка клиента, если переданы fullName и phone
      if (fullName && phone) {
        // Проверяем, существует ли пользователь с таким phone
        const existingUser = await prismaTx.user.findFirst({
          where: { phone },
        });

        if (existingUser) {
          // Обновляем существующего пользователя
          const updatedUser = await prismaTx.user.update({
            where: { uuid: existingUser.uuid },
            data: { fullName },
          });
          clientUuid = updatedUser.uuid;
        } else {
          // Создаем нового пользователя
          const newUser = await prismaTx.user.create({
            data: {
              fullName,
              phone,
              role: UserRole.None,
              email: `${Date.now()}@temp.com`,
              password: 'temp_password',
              gender: Gender.None,
            },
          });
          clientUuid = newUser.uuid;
        }
      } else {
        const client = await prismaTx.user.findUnique({ where: { uuid: corpClientId } });
        if (!client) {
          logError(`× Клиент ${corpClientId} не найден (400)`);
          throw new Error('Client not found');
        }
      }

      // Проверяем связанные сущности
      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        logError(`× Тариф ${tariffUuid} не найден (400)`);
        throw new Error('Tariff not found');
      }

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        logError(`× Точка отправления ${departurePoint} не найдена (400)`); // Исправлена опечатка
        throw new Error('Departure point not found');
      }

      const arrivalPointRecord = await prismaTx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) {
        logError(`× Точка прибытия ${arrivalPoint} не найдена (400)`);
        throw new Error('Arrival point not found');
      }

      if (assignedDriverId) {
        const driver = await prismaTx.user.findUnique({ where: { uuid: assignedDriverId } });
        if (!driver || driver.role !== UserRole.Driver) {
          logError(`× Водитель ${assignedDriverId} не найден/не Driver (400)`);
          throw new Error('Driver not found');
        }
      }

      // Обновляем заказ
      const order = await prismaTx.order.update({
        where: { uuid },
        data: {
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : undefined,
          status: orderStatus, // Используется скорректированный orderStatus
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
          driverAcceptanceStatus: assignedDriverId ? DriverAcceptanceStatus.PENDING : null,
        },
      });

      // Обновляем дополнительные услуги
      if (selectedServices) {
        // Удаляем старые услуги
        await prismaTx.orderOnTariffAdditionalService.deleteMany({
          where: { orderUuid: uuid },
        });

        // Проверяем и добавляем новые услуги
        if (selectedServices.length > 0) {
          const tariffOnServices = await prismaTx.tariffOnService.findMany({
            where: { uuid: { in: selectedServices } },
          });
          if (tariffOnServices.length !== selectedServices.length) {
            logError(`× Не все услуги найдены для тарифа ${tariffUuid} (400)`);
            throw new Error('Not all services found for tariff');
          }
          await prismaTx.orderOnTariffAdditionalService.createMany({
            data: tariffOnServices.map((t) => ({
              uuid: uuidv4(),
              orderUuid: order.uuid,
              tariffOnServiceUuid: t.uuid,
            })),
          });
        }
      }

      return order;
    });

    // Рассылаем уведомления
    try {
      await processNotification({
        userId: adminUserId,
        orderId: updatedOrder.uuid,
        action: Action.info,
        templateKey: 'orderUpdatedByAdminToAdmin',
        createdById: adminUserId,
      });
      await processNotification({
        userId: corpClientId,
        orderId: updatedOrder.uuid,
        action: Action.noted,
        templateKey: 'orderUpdatedByAdminToClient',
        createdById: corpClientId,
      });
      if (assignedDriverId && assignedDriverId !== existingOrder.assignedDriverId) {
        await processNotification({
          userId: assignedDriverId,
          orderId: updatedOrder.uuid,
          action: Action.noted,
          templateKey: 'orderUpdatedDriverAssigned',
          createdById: adminUserId,
          driverById: assignedDriverId,
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
  } catch (error) {
    logError('× Ошибка при обновлении заказа (500)');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  }
}

//DELETE-запрос: удаление заказа и связанных задач
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Attempting to delete order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    // Аутентификация: удалять может только админ или оператор
    const token: JwtPayload = await authenticateRequest(req, [UserRole.Admin, UserRole.Operator]);
    const adminUserId = token.uuid;
    log('Аутентификация пройдена, adminUserId:', adminUserId);

    // Получаем данные заказа до удаления
    const order = await prisma.order.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        createdById: true,
        assignedDriverId: true,
        departurePointId: true,
        arrivalPointId: true,
      },
    });
    if (!order) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    log('Данные заказа получены:', order);

    // Отправляем уведомления до удаления
    try {
      log('Sending deletion notifications');

      // Уведомление админу
      await processNotification({
        userId: adminUserId,
        orderId: uuid,
        action: Action.info,
        templateKey: 'orderDeletedByAdminToAdmin',
        createdById: adminUserId,
      });
      log('Notification sent to admin');

      // Уведомление клиенту
      await processNotification({
        userId: order.createdById,
        orderId: uuid,
        action: Action.info,
        templateKey: 'orderDeletedByAdminToClient',
        createdById: adminUserId,
      });
      log('Notification sent to client');

      // Уведомление водителю, если он был назначен
      if (order.assignedDriverId) {
        await processNotification({
          userId: order.assignedDriverId,
          orderId: uuid,
          action: Action.info,
          templateKey: 'orderDeletedByAdminToDriver',
          createdById: adminUserId,
          driverById: order.assignedDriverId,
        });
        log('Notification sent to driver');
      }
    } catch (notifyError) {
      log('Error sending notifications (non-critical):', notifyError);
    }

    // Удаляем заказ после отправки уведомлений
    await prisma.order.delete({ where: { uuid } });
    log(`Order with UUID ${uuid} deleted successfully`);

    // Удаляем связанные задачи из очереди
    const job1 = await orderQueue.getJob(`notification-${uuid}`);
    if (job1) await job1.remove();
    const job2 = await orderQueue.getJob(`checkoverdue-${uuid}`);
    if (job2) await job2.remove();
    log(`Tasks with jobIds notification-${uuid} and checkoverdue-${uuid} removed from queue`);

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    log('Error deleting order:', error);
    return NextResponse.json({ error: 'Unable to delete order' }, { status: 500 });
  }
}
