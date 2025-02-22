import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import { Decimal } from 'decimal.js';
import { Action, OrderStatus, UserRole } from '@prisma/client';
import { processNotification, processBulkNotifications } from '@next-app/src/utils/notifications/notifications';
import { authenticateRequest, JwtPayload } from '@next-app/src/utils/authenticate/authenticateRequest';

const log = debug('app:client-corp/orders');

/** GET-запрос: Получение заказа по UUID */
export async function GET(req: NextRequest) {
  try {
    // Используем функцию для аутентификации, без проверки конкретных ролей
    const token: JwtPayload = await authenticateRequest(req);
    const userId = token.uuid;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);
    const status = searchParams.get('status') as OrderStatus | null;
    const sortBy =
      (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice') || 'createdAt';
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
        createdBy: true,
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

/** POST-запрос: Создание заказа для ClientCorp и отправка уведомлений */
export async function POST(req: NextRequest) {
  try {
    // Используем authenticateRequest с проверкой, что роль клиента должна быть ClientCorp
    const token: JwtPayload = await authenticateRequest(req, [UserRole.ClientCorp]);
    const clientUuid = token.uuid;

    let data: CreateClientCorpOrderData;
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

    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction for order creation');

      // Проверяем, что клиент существует и имеет роль ClientCorp
      const client = await prismaTx.user.findUnique({ where: { uuid: clientUuid } });
      if (!client) {
        log(`Client with UUID ${clientUuid} not found`);
        throw new Error('Client not found');
      }
      // Если функция authenticateRequest прошла проверку allowedRoles, дополнительная проверка роли не обязательна

      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        log(`Tariff with UUID ${tariffUuid} not found`);
        throw new Error('Tariff not found');
      }
      log('Tariff found:', tariffRecord);

      const departurePointRecord = await prismaTx.point.findUnique({ where: { uuid: departurePoint } });
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
          log(`Not all services found for tariff ${tariffUuid}. Selected: ${selectedServices.join(', ')}`);
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

      // Уведомления:
      // 1. Уведомление клиенту
      await processNotification({
        userId: clientUuid,
        orderId: order.uuid,
        action: Action.info,
        templateKey: 'orderCreatedByCorpClientToClient',
        createdById: clientUuid,
      });
      // 2. Массовая отправка уведомлений админам и операторам
      const adminsAndOperators = await prismaTx.user.findMany({
        where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
      });
      if (adminsAndOperators.length > 0) {
        await processBulkNotifications({
          users: adminsAndOperators,
          orderId: order.uuid,
          action: Action.info,
          templateKey: 'orderCreatedByCorpClientToAdmins',
          createdById: clientUuid,
        });
      }
      return order;
    });

    // Добавляем отложенное уведомление в очередь
    const departureTimestamp = new Date(result.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60000;
    if (delay > 0) {
      await orderQueue.add(
        'notification',
        { orderUuid: result.uuid },
        {
          delay,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`Notification job added, jobId: notification-${result.uuid}`);
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating order:', error);
    // Если ошибка связана с аутентификацией или авторизацией, возвращаем 401
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
