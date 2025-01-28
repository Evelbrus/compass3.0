import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { OrderStatus } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:orders');

interface Params {
  uuid: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { uuid } = params;
  log(`Fetching order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: true,
        orderTariffAdditionalServices: {
          include: {
            tariffOnService: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    log('Fetched order:', order);

    const response = {
      ...order,
      createdBy: {
        uuid: order.createdBy.uuid,
        fullName: order.createdBy.fullName,
        email: order.createdBy.email,
        phone: order.createdBy.phone,
      },
      assignedDriver: order.assignedDriver
        ? {
            uuid: order.assignedDriver.uuid,
            fullName: order.assignedDriver.fullName,
            email: order.assignedDriver.email,
            phone: order.assignedDriver.phone,
          }
        : null,
      tariff: {
        uuid: order.tariff.uuid,
        name: order.tariff.name,
        vehicleTypes: order.tariff.vehicleType,
        serviceLevel: order.tariff.serviceLevel,
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        basePrice: order.departurePoint.basePrice,
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        basePrice: order.arrivalPoint.basePrice,
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
    };

    return NextResponse.json(response);
  } catch (error) {
    log('Error fetching order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { uuid } = params;

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

  const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction for order update');

      //1. Проверка существования заказа
      const existingOrder = await prismaTx.order.findUnique({
        where: { uuid: uuid },
      });

      if (!existingOrder) {
        log(`Order with UUID ${uuid} not found`);
        throw new Error('Order not found');
      }
      log('Order found:', existingOrder);

      //2. Проверка существования клиента
      const client = await prismaTx.user.findUnique({
        where: { uuid: createdBy },
      });
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
        const driver = await prismaTx.user.findUnique({
          where: { uuid: assignedDriverId },
        });
        if (!driver) {
          log(`Driver with UUID ${assignedDriverId} not found`);
          throw new Error('Driver not found');
        }
        log('Driver found:', driver);
      }

      //7. Обновление заказа
      const updatedOrder = await prismaTx.order.update({
        where: { uuid: uuid },
        data: {
          createdById: createdBy,
          tariffUuid,
          departureTime: new Date(departureTime!),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
        },
      });

      log('Order updated:', updatedOrder);

      //8. Удаление старых дополнительных услуг
      await prismaTx.orderOnTariffAdditionalService.deleteMany({
        where: {
          orderUuid: uuid,
        },
      });
      log('Old additional services removed');
      //9. Добавление новых дополнительных услуг
      if (selectedServices && selectedServices.length > 0) {
        log('Selected services (tariffOnServiceUuid):', selectedServices);
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: {
            uuid: {
              in: selectedServices,
            },
          },
        });
        log(
          'Found tariffOnServices:',
          tariffOnServices.map((tos) => tos.uuid),
        );
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
      //10. Возвращение обновленного заказа с дополнительными услугами
      const finalOrder = await prismaTx.order.findUnique({
        where: { uuid: updatedOrder.uuid },
        include: {
          orderTariffAdditionalServices: {
            include: {
              tariffOnService: true,
            },
          },
        },
      });
      log('Updated order with additional services:', finalOrder);

      return finalOrder;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    log('Error updating order:', error);
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { uuid } = params;
  log(`Attempting to delete order with UUID: ${uuid}`);

  if (!uuid) {
    log('Order UUID is missing');
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { uuid },
    });

    if (!order) {
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.delete({
      where: { uuid },
    });

    log(`Order with UUID ${uuid} deleted successfully`);
    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    log('Error deleting order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to delete order' }, { status: 500 });
  }
}
