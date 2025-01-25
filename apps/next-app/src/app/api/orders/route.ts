import { NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';

const log = debug('app:orders');
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

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
        assignedDriver: {
          include: {
            user: true,
          },
        },
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

    //Преобразуем, чтобы в ответе отдать список "доп. услуг" внутри заказа
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
      assignedDriver: order.assignedDriver
        ? {
            uuid: order.assignedDriver.uuid,
            fullName: order.assignedDriver.user?.fullName || '',
            phone: order.assignedDriver.user?.phone || '',
          }
        : null,
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
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

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
    assignedDriverId,
    assignedDriverUserId,
    selectedServices,
  } = data;

  const missingFields: string[] = [];
  if (!createdBy) missingFields.push('createdBy');
  if (!tariffUuid) missingFields.push('tariffUuid');
  if (!departureTime) missingFields.push('departureTime');
  if (!departurePoint) missingFields.push('departurePoint');
  if (!arrivalPoint) missingFields.push('arrivalPoint');
  if (basePrice === undefined || basePrice === null) missingFields.push('basePrice');

  if (missingFields.length > 0) {
    log('Missing required fields:', missingFields);
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 },
    );
  }

  const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction');

      const client = await prismaTx.user.findUnique({
        where: { uuid: createdBy },
      });
      if (!client) throw new Error('Client not found');
      log('Client found:', client);

      const tariffRecord = await prismaTx.tariff.findUnique({
        where: { uuid: tariffUuid },
      });
      if (!tariffRecord) throw new Error('Tariff not found');
      log('Tariff found:', tariffRecord);

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) throw new Error('Departure point not found');
      log('Departure point found:', departurePointRecord);

      const arrivalPointRecord = await prismaTx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) throw new Error('Arrival point not found');
      log('Arrival point found:', arrivalPointRecord);

      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          createdById: createdBy,
          tariffUuid,
          departureTime: new Date(departureTime!),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: new Decimal(basePrice!),
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
        },
      });
      log('Order created:', order);

      if (selectedServices && selectedServices.length > 0) {
        await prismaTx.orderOnTariffAdditionalService.createMany({
          data: selectedServices.map((serviceUuid) => ({
            uuid: uuidv4(),
            orderUuid: order.uuid,
            tariffOnServiceUuid: serviceUuid,
          })),
        });
        log('Additional services added');
      }

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
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
