import { NextRequest, NextResponse } from 'next/server';
import {
  Action,
  Gender,
  OrderStatus,
  UserRole,
  DriverAcceptanceStatus,
} from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { prisma } from '@shared/prisma/prisma-client';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { processNotification } from '@next-app/src/utils/notifications/notifications';
import { authenticateRequest, JwtPayload } from '@next-app/src/utils/authenticate/authenticateRequest';

const logError = debug('app:orders:error');

/**
 * POST /api/orders
 * Создает заказ и рассылает уведомления:
 * - Администратору (идентификатор берется из токена)
 * - Корпоративному клиенту (поле createdBy из тела запроса)
 * - Водителю (если выбран)
 */
export async function POST(req: NextRequest) {
  let token: JwtPayload;
  const allowedRoles = [UserRole.Operator, UserRole.Admin];
  try {
    token = await authenticateRequest(req, allowedRoles);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Идентификатор администратора, создающего заказ, извлекается из токена
  const adminUserId = token.uuid;

  try {
    let data: CreateOrderData;
    try {
      data = await req.json();
    } catch (error) {
      logError('× Ошибка разбора JSON (400)');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // createdBy — идентификатор корпоративного клиента, для которого создается заказ
    const corpClientId = data.createdBy;
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
    } = data;

    const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

    // Создаем заказ в транзакции
    const createdOrder = await prisma.$transaction(async (prismaTx) => {
      let clientUuid = corpClientId;
      if (fullName && phone) {
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
      } else {
        const client = await prismaTx.user.findUnique({ where: { uuid: corpClientId } });
        if (!client) {
          logError(`× Клиент ${corpClientId} не найден (400)`);
          throw new Error('Client not found');
        }
      }
      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        logError(`× Тариф ${tariffUuid} не найден (400)`);
        throw new Error('Tariff not found');
      }
      const departurePointRecord = await prismaTx.point.findUnique({ where: { uuid: departurePoint } });
      if (!departurePointRecord) {
        logError(`× Точка отправления ${departurePoint} не найдена (400)`);
        throw new Error('Departure point not found');
      }
      const arrivalPointRecord = await prismaTx.point.findUnique({ where: { uuid: arrivalPoint } });
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
      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
          driverAcceptanceStatus: assignedDriverId ? DriverAcceptanceStatus.PENDING : null,
        },
      });
      if (selectedServices && selectedServices.length > 0) {
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
      return order;
    });

    // Рассылаем уведомления через processNotification
    try {
      await processNotification({
        userId: adminUserId,
        orderId: createdOrder.uuid,
        action: Action.info,
        templateKey: 'orderCreatedByAdminToAdmin',
        createdById: adminUserId,
      });
      await processNotification({
        userId: corpClientId,
        orderId: createdOrder.uuid,
        action: Action.noted,
        templateKey: 'orderCreatedByAdminToClient',
        createdById: adminUserId,
      });
      if (assignedDriverId) {
        await processNotification({
          userId: assignedDriverId,
          orderId: createdOrder.uuid,
          action: Action.noted,
          templateKey: 'orderCreatedDriverAssigned',
          createdById: adminUserId,
          driverById: assignedDriverId,
        });
      }
    } catch (notifyErr) {
      logError('× Ошибка при отправке уведомления (не критично для создания заказа)');
      if (notifyErr instanceof Error) {
        logError('Error message:', notifyErr.message);
        logError('Error stack:', notifyErr.stack);
      }
    }

    // Планирование задач
    const departureTimestamp = new Date(createdOrder.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60_000;

    if (delay <= 0) {
      console.log(`⚠️ DepartureTime (${createdOrder.departureTime}) уже меньше минуты или прошло, отправляем notification мгновенно`);
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
      console.log(`⏱ Планируем checkoverdue для заказа ${createdOrder.uuid} через 1 минуту`);
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: createdOrder.uuid },
        {
          delay: 60_000, // 1 минута
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${createdOrder.uuid}`,
        },
      );
    } else {
      console.log(`⏱ Задача "notification" для заказа ${createdOrder.uuid} запланирована через ${delay} мс`);
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
      console.log(`⏱ Планируем checkoverdue для заказа ${createdOrder.uuid} через ${delay + 60_000} мс`);
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

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    logError('× Ошибка при создании заказа (500)');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}

/**
 * GET /api/orders
 * Получает список заказов с пагинацией, фильтрацией по статусу и сортировкой.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedParams = {
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      per_page: Math.max(1, Math.min(100, parseInt(searchParams.get('per_page') || '10', 10))),
      status: searchParams.get('status') as OrderStatus | null,
      sort_by:
        (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice') || 'createdAt',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const where: { status?: OrderStatus } = {};
    if (parsedParams.status) {
      where.status = parsedParams.status;
    }

    const orders = await prisma.order.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        orderTariffAdditionalServices: {
          include: {
            tariffOnService: {
              include: { service: true },
            },
          },
        },
      },
    });

    const total = await prisma.order.count({ where });
    const totalAllOrders = await prisma.order.count();
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      totalAllOrders,
      statusesCount,
      orders: orders.map((order) => ({
        ...order,
        createdBy: {
          uuid: order.createdBy.uuid,
          fullName: order.createdBy.fullName,
          email: order.createdBy.email,
          phone: order.createdBy.phone,
        },
        tariff: {
          uuid: order.tariff.uuid,
          name: order.tariff.name,
          vehicleTypes: order.tariff.vehicleType,
        },
        departurePoint: {
          uuid: order.departurePoint.uuid,
          address: order.departurePoint.address,
          pricePerKm: order.departurePoint.pricePerKm,
          terrainDifficulty: order.departurePoint.terrainDifficulty,
          latitude: order.departurePoint.latitude,
          longitude: order.departurePoint.longitude,
        },
        arrivalPoint: {
          uuid: order.arrivalPoint.uuid,
          address: order.arrivalPoint.address,
          pricePerKm: order.arrivalPoint.pricePerKm,
          terrainDifficulty: order.arrivalPoint.terrainDifficulty,
          latitude: order.arrivalPoint.latitude,
          longitude: order.arrivalPoint.longitude,
        },
        orderTariffAdditionalServices: order.orderTariffAdditionalServices.map((ots) => ({
          uuid: ots.uuid,
          tariffOnServiceUuid: ots.tariffOnServiceUuid,
          createdAt: ots.createdAt,
          updatedAt: ots.updatedAt,
          tariffOnService: {
            uuid: ots.tariffOnService.uuid,
            price: ots.tariffOnService.price,
            isAvailable: ots.tariffOnService.isAvailable,
            serviceUuid: ots.tariffOnService.serviceUuid,
            createdAt: ots.tariffOnService.createdAt,
            updatedAt: ots.tariffOnService.updatedAt,
            name: ots.tariffOnService.service.name,
          },
        })),
      })),
    });
  } catch (error) {
    logError('× Ошибка при получении списка заказов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch orders' }, { status: 500 });
  }
}
