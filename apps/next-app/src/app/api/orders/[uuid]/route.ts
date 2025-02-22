import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { Action, DriverAcceptanceStatus, UserRole } from '@prisma/client';
import { authenticateRequest, JwtPayload } from '@next-app/src/utils/authenticate/authenticateRequest';

const log = debug('app:orders');

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

//DELETE-запрос: удаление заказа и связанных задач
export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Attempting to delete order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { uuid } });
    if (!order) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    await prisma.order.delete({ where: { uuid } });
    log(`Order with UUID ${uuid} deleted successfully`);

    //Удаляем связанные задачи из очереди
    const job1 = await orderQueue.getJob(`notification-${uuid}`);
    if (job1) await job1.remove();
    const job2 = await orderQueue.getJob(`checkOverdue-${uuid}`);
    if (job2) await job2.remove();

    log(`Tasks with jobIds notification-${uuid} and checkOverdue-${uuid} removed from queue`);

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    log('Error deleting order:', error);
    return NextResponse.json({ error: 'Unable to delete order' }, { status: 500 });
  }
}
