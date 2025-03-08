import { NextRequest, NextResponse } from 'next/server';
import { Action, OrderStatus, UserRole } from '@prisma/client';
import debug from 'debug';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { processNotification } from '@next-app/src/utils/notifications/notifications';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { createOrder, getOrders } from '@next-app/src/app/api/orders/prismaOrders';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

const logError = debug('app:orders:error');
const allowedRoles = [UserRole.Operator, UserRole.Admin];

export async function POST(req: NextRequest) {
  const token = await authenticateRequest(req, allowedRoles);
  const adminUserId = token.uuid;

  const data: CreateOrderData = await req.json();
  const corpClientId = data.createdBy;
  const { assignedDriverId } = data;

  const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

  let createdOrder;
  try {
    createdOrder = await createOrder(data, orderStatus);
  } catch (error) {
    logError('× Ошибка при создании заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
      if (
        error.message === 'Client not found' ||
        error.message === 'Tariff not found' ||
        error.message === 'Departure point not found' ||
        error.message === 'Arrival point not found' ||
        error.message === 'Driver not found' ||
        error.message === 'Not all services found for tariff'
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }

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
      createdById: corpClientId,
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
    console.log(`⏱ Планируем checkoverdue для заказа ${createdOrder.uuid} через 1 минуту`);
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
    console.log(
      `⏱ Планируем checkoverdue для заказа ${createdOrder.uuid} через ${delay + 60_000} мс`,
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

  return NextResponse.json(createdOrder, { status: 201 });
}

export async function GET(req: NextRequest) {
  await authenticateRequest(req, allowedRoles);

  const parsedParams = parseParams<{
    page: number;
    per_page: number;
    status: OrderStatus | null;
    sort_by: 'createdAt' | 'updatedAt' | 'finalPrice' | 'departureTime';
    sort_order: 'asc' | 'desc';
  }>({
    searchParams: new URL(req.url).searchParams,
    defaults: { sort_by: 'departureTime', sort_order: 'asc' },
    allowedSortFields: ['createdAt', 'updatedAt', 'finalPrice', 'departureTime'],
  });

  const { orders, total, totalAllOrders, statusesCount } = await getOrders(parsedParams);

  return NextResponse.json({
    page: parsedParams.page,
    per_page: parsedParams.per_page,
    total,
    totalAllOrders,
    statusesCount: statusesCount,
    orders: orders.map((order) => ({
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
      basePrice: order.basePrice,
      assignedDriver: {
        uuid: order.assignedDriver?.uuid || null,
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
}
