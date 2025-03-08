import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { Decimal } from 'decimal.js';
import { Action, OrderStatus, UserRole } from '@prisma/client';
import {
  processNotification,
  processBulkNotifications,
} from '@next-app/src/utils/notifications/notifications';
import {
  authenticateRequest,
  JwtPayload,
} from '@next-app/src/utils/authenticate/authenticateRequest';

const log = debug('app:client-corp/orders');

/** POST-запрос: Создание заказа для ClientCorp и отправка уведомлений */
export async function POST(req: NextRequest) {
  try {
    // Аутентификация с проверкой роли ClientCorp
    const token: JwtPayload = await authenticateRequest(req, [UserRole.ClientCorp]);
    const clientUuid = token.uuid;

    let data: any;
    try {
      data = await req.json();
      log('Received data:', data);
    } catch (error) {
      log('Error parsing JSON:', error);
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
      description,
      flightNumber,
      waitingTimeMinutes,
    } = data;

    if (!departureTime) {
      log('departureTime is missing');
      return NextResponse.json({ error: 'departureTime is required' }, { status: 400 });
    }
    log('Selected services:', selectedServices);

    // Создание заказа в транзакции
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction for order creation');

      // Проверяем, что клиент существует и имеет роль ClientCorp
      const client = await prismaTx.user.findUnique({ where: { uuid: clientUuid } });
      if (!client) {
        log(`Client with UUID ${clientUuid} not found`);
        throw new Error('Client not found');
      }

      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        log(`Tariff with UUID ${tariffUuid} not found`);
        throw new Error('Tariff not found');
      }
      log('Tariff found:', tariffRecord);

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        log(`Departure point with UUID ${departurePoint} not found`);
        throw new Error('Departure point not found');
      }
      log('Departure point found:', departurePointRecord);

      const arrivalPointRecord = await prismaTx.point.findUnique({ where: { uuid: arrivalPoint } });
      if (!arrivalPointRecord) {
        log(`Arrival point with UUID ${arrivalPoint} not found`);
        throw new Error('Arrival point not found');
      }
      log('Arrival point found:', arrivalPointRecord);

      // Создаем заказ
      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: OrderStatus.PENDING,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
        },
      });
      log('Order created:', order);

      // Добавляем дополнительные услуги, если указаны
      if (selectedServices && selectedServices.length > 0) {
        log('Selected services (tariffOnServiceUuid):', selectedServices);
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: { uuid: { in: selectedServices } },
        });
        if (tariffOnServices.length !== selectedServices.length) {
          log(
            `Not all services found for tariff ${tariffUuid}. Selected: ${selectedServices.join(', ')}`,
          );
          throw new Error('Not all services found for tariff');
        }
        await prismaTx.orderOnTariffAdditionalService.createMany({
          data: tariffOnServices.map((tariffOnService) => ({
            uuid: uuidv4(),
            orderUuid: order.uuid,
            tariffOnServiceUuid: tariffOnService.uuid,
          })),
        });
        log('Additional services added');
      }

      return order;
    });

    // Уведомления после транзакции
    try {
      log('Before processNotification');
      await processNotification({
        userId: clientUuid,
        orderId: result.uuid,
        action: Action.info,
        templateKey: 'orderCreatedByCorpClientToClient',
        createdById: clientUuid,
      });
      log('After processNotification');

      const adminsAndOperators = await prisma.user.findMany({
        where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
      });
      log('Admins and operators fetched:', adminsAndOperators.length);
      if (adminsAndOperators.length > 0) {
        log('Before processBulkNotifications');
        await processBulkNotifications({
          users: adminsAndOperators,
          orderId: result.uuid,
          action: Action.info,
          templateKey: 'orderCreatedByCorpClientToAdmins',
          createdById: clientUuid,
        });
        log('After processBulkNotifications');
      }
    } catch (notifyError) {
      log('Notification error (non-critical):', notifyError);
    }

    // Добавляем отложенные задачи в очередь
    const departureTimestamp = new Date(result.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60_000;

    log(`departureTimestamp: ${departureTimestamp}, now: ${now}, delay: ${delay}`);

    if (delay <= 0) {
      log(
        `⚠️ DepartureTime (${result.departureTime}) уже меньше минуты или прошло, отправляем notification мгновенно`,
      );
      await orderQueue.add(
        'notification',
        { orderUuid: result.uuid },
        {
          delay: 0,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`⏱ Планируем checkoverdue для заказа ${result.uuid} через 1 минуту`);
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: result.uuid },
        {
          delay: 60_000, // 1 минута
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${result.uuid}`,
        },
      );
    } else {
      log(`⏱ Задача "notification" для заказа ${result.uuid} запланирована через ${delay} мс`);
      await orderQueue.add(
        'notification',
        { orderUuid: result.uuid },
        {
          delay: Math.max(delay, 0),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`⏱ Планируем checkoverdue для заказа ${result.uuid} через ${delay + 60_000} мс`);
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: result.uuid },
        {
          delay: delay + 60_000, // Через 1 минуту после notification
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${result.uuid}`,
        },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating order:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}

/** GET-запрос: Получение заказа по UUID */
export async function GET(req: NextRequest) {
  try {
    const token: JwtPayload = await authenticateRequest(req);
    const userId = token.uuid;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);
    const status = searchParams.get('status') as OrderStatus | null;
    // Меняем sortBy по умолчанию на departureTime
    const sortBy =
      (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice' | 'departureTime') ||
      'departureTime';
    // Меняем sortOrder по умолчанию на asc
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

    log(
      `Fetching orders for ClientCorp ${userId}, page: ${page}, perPage: ${perPage}, status: ${status}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
    );

    const where: { createdById: string; status?: OrderStatus } = { createdById: userId };
    if (status) {
      where.status = status;
    }
    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          include: {
            companyProfile: true,
          },
        },
        assignedDriver: {
          include: {
            vehicleDriver: {
              include: {
                vehicle: {
                  select: {
                    plateNumber: true,
                  },
                },
              },
            },
          },
        },
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        orderTariffAdditionalServices: {
          include: { tariffOnService: { include: { service: true } } },
        },
      },
    });
    const total = await prisma.order.count({ where });
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { createdById: userId },
    });
    log(`Fetched ${orders.length} orders for ClientCorp: ${userId}`);

    const response = orders.map((order) => ({
      ...order,
      createdBy: {
        uuid: order.createdBy.uuid,
        fullName: order.createdBy.fullName,
        email: order.createdBy.email,
        phone: order.createdBy.phone,
        role: order.createdBy.role,
        companyProfile: {
          companyName: order.createdBy.companyProfile?.companyName || null,
          companyPhone: order.createdBy.companyProfile?.phone || null,
          companyLogo: order.createdBy.companyProfile?.logoImagePath || null,
        },
      },
      assignedDriver: {
        uuid: order.assignedDriver?.fullName || null,
        plateNumber: order.assignedDriver?.vehicleDriver?.vehicle.plateNumber || null,
        fullName: order.assignedDriver?.fullName || null,
        phone: order.assignedDriver?.phone || null,
      },
      driverAcceptanceStatus: order.driverAcceptanceStatus || null,
      tariff: {
        uuid: order.tariff.uuid,
        name: order.tariff.name,
        vehicleType: order.tariff.vehicleType,
        serviceLevel: order.tariff.serviceLevel,
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        pricePerKm: order.departurePoint.pricePerKm,
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        pricePerKm: order.arrivalPoint.pricePerKm,
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
    }));

    return NextResponse.json({
      status: 'success',
      page,
      per_page: perPage,
      total,
      statusesCount,
      orders: response,
    });
  } catch (error) {
    log('Error fetching orders for ClientCorp:', error);
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }
}
