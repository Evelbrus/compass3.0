import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:orders');

//GET: Получение заказов с пагинацией, фильтрацией и сортировкой
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    status: searchParams.get('status') as OrderStatus | null,
    sort_by:
      (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
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
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.order.count({ where });
    const totalAllOrders = await prisma.order.count();
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    log('Fetched orders:', orders);

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
    }));

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      totalAllOrders,
      statusesCount,
      orders: response,
    });
  } catch (error) {
    log('Error fetching orders:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch orders' }, { status: 500 });
  }
}

//POST: Создание нового заказа
export async function POST(req: Request) {
  let data: CreateOrderData;
  try {
    data = await req.json();
    log('Received data:', data);
  } catch (error) {
    log('Error parsing JSON:', error);
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
      log('Starting transaction');

      //1. Проверка существования клиента
      const client = await prismaTx.user.findUnique({
        where: { uuid: createdBy },
      });
      if (!client) {
        log(`Client with UUID ${createdBy} not found`);
        throw new Error('Client not found');
      }
      log('Client found:', client);

      //2. Проверка существования тарифа
      const tariffRecord = await prismaTx.tariff.findUnique({
        where: { uuid: tariffUuid },
      });
      if (!tariffRecord) {
        log(`Tariff with UUID ${tariffUuid} not found`);
        throw new Error('Tariff not found');
      }
      log('Tariff found:', tariffRecord);

      //3. Проверка существования точки отправления
      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        log(`Departure point with UUID ${departurePoint} not found`);
        throw new Error('Departure point not found');
      }
      log('Departure point found:', departurePointRecord);

      //4. Проверка существования точки прибытия
      const arrivalPointRecord = await prismaTx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) {
        log(`Arrival point with UUID ${arrivalPoint} not found`);
        throw new Error('Arrival point not found');
      }
      log('Arrival point found:', arrivalPointRecord);

      //5. Проверка существования водителя
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

      //6. Создание заказа
      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
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
      log('Order created:', order);

      //7. Добавление дополнительных услуг
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
            orderUuid: order.uuid,
            tariffOnServiceUuid: tariffOnService.uuid,
          })),
        });
        log('Additional services added');
      }

      //8. Обновление заказа
      const updatedOrder = await prismaTx.order.findUnique({
        where: { uuid: order.uuid },
        include: {
          orderTariffAdditionalServices: {
            include: {
              tariffOnService: true,
            },
          },
        },
      });
      log('Updated order:', updatedOrder);

      return updatedOrder;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating order:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}
