import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';

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
export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  let data: CreateOrderData;
  try {
    data = await req.json();
    log('Received data for update:', data);
  } catch (error) {
    log('Error parsing JSON for update:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    createdBy,
    tariffUuid,
    departureTime,
    departurePoint,
    arrivalPoint,
    intermediatePoints,
    basePrice,
    selectedServices,
    assignedDriverId,
  } = data;

  console.log('selectedServices отправленные на сервер:', selectedServices);

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction for order update');

      //1. Проверка существования заказа
      const existingOrder = await prismaTx.order.findUnique({ where: { uuid } });
      if (!existingOrder) {
        log(`Order with UUID ${uuid} not found`);
        throw new Error('Order not found');
      }
      log('Order found:', existingOrder);

      //2. Проверка существования клиента
      const client = await prismaTx.user.findUnique({ where: { uuid: createdBy } });
      if (!client) {
        log(`Client with UUID ${createdBy} not found`);
        throw new Error('Client not found');
      }
      log('Client found:', client);

      //3. Проверка существования тарифа
      const tariffRecord = await prismaTx.tariff.findUnique({
        where: { uuid: tariffUuid },
      });
      if (!tariffRecord) {
        log(`Tariff with UUID ${tariffUuid} not found`);
        throw new Error('Tariff not found');
      }
      log('Tariff found:', tariffRecord);

      //4. Проверка существования точки отправления
      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        log(`Departure point with UUID ${departurePoint} not found`);
        throw new Error('Departure point not found');
      }
      log('Departure point found:', departurePointRecord);

      //5. Проверка существования точки прибытия
      const arrivalPointRecord = await prismaTx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) {
        log(`Arrival point with UUID ${arrivalPoint} not found`);
        throw new Error('Arrival point not found');
      }
      log('Arrival point found:', arrivalPointRecord);

      //6. Проверка существования водителя
      if (assignedDriverId) {
        const driver = await prismaTx.user.findUnique({ where: { uuid: assignedDriverId } });
        if (!driver) {
          log(`Driver with UUID ${assignedDriverId} not found`);
          throw new Error('Driver not found');
        }
        log('Driver found:', driver);
      }

      //7. Обновление заказа
      const updatedOrder = await prismaTx.order.update({
        where: { uuid },
        data: {
          createdById: createdBy,
          tariffUuid,
          departureTime: new Date(departureTime!),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: new Decimal(basePrice ?? 0),
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
        },
      });
      log('Order updated:', updatedOrder);

      //8. Удаление старых дополнительных услуг
      await prismaTx.orderOnTariffAdditionalService.deleteMany({ where: { orderUuid: uuid } });
      log('Old additional services removed');

      //9. Добавление новых дополнительных услуг
      if (selectedServices && selectedServices.length > 0) {
        log('Selected services (tariffOnServiceUuid):', selectedServices);
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: { uuid: { in: selectedServices } },
          include: { service: true },
        });
        if (tariffOnServices.length !== selectedServices.length) {
          log(
            `Not all services found for tariff ${tariffUuid}. Selected services: ${selectedServices.join(', ')}`,
          );
          throw new Error('Not all services found for tariff');
        }
        await prismaTx.orderOnTariffAdditionalService.createMany({
          data: tariffOnServices.map((tariffOnService) => ({
            uuid: uuidv4(),
            orderUuid: updatedOrder.uuid,
            tariffOnServiceUuid: tariffOnService.uuid,
          })),
        });
        log('New additional services added');
      }

      //10. Возвращаем обновленный заказ
      const finalOrder = await prismaTx.order.findUnique({
        where: { uuid: updatedOrder.uuid },
        include: {
          tariff: {
            include: {
              tariffAdditionalServices: {
                include: { service: true },
              },
            },
          },
          orderTariffAdditionalServices: {
            include: { tariffOnService: true },
          },
        },
      });
      log('Updated order with additional services:', finalOrder);
      return finalOrder;
    });

    if (!result) {
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
    }

    //Обновляем задачу в очереди, если departureTime или другие ключевые поля изменились
    const departureTimestamp = new Date(result.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60000;

    //Проверяем, существует ли задача
    const existingJob = await orderQueue.getJob(`notification-${result.uuid}`);
    if (existingJob) {
      const currentDelay = existingJob.opts.delay;
      const currentData = existingJob.data;

      if (currentDelay !== delay || JSON.stringify(currentData.order) !== JSON.stringify(result)) {
        await existingJob.remove();
        await orderQueue.add(
          'notification',
          { order: result },
          {
            delay: delay > 0 ? delay : 0,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            jobId: `notification-${result.uuid}`,
          },
        );
        log(`📌 Задача notification обновлена, jobId: notification-${result.uuid}`);
      } else {
        log(`📌 Задача notification не требует обновления, jobId: notification-${result.uuid}`);
      }
    } else {
      await orderQueue.add(
        'notification',
        { order: result },
        {
          delay: delay > 0 ? delay : 0,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`📌 Новая задача notification создана, jobId: notification-${result.uuid}`);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    log('Error updating order:', error);
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  }
}

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
