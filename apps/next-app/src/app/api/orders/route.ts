import { NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:orders');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
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
    //Создаем объект "where" для условий фильтрации
    const where: { status?: OrderStatus } = {};
    if (parsedParams.status) {
      where.status = parsedParams.status;
    }

    //Выполняем запрос к базе данных для получения списка заказов
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
      },
    });

    //Подсчитываем общее количество заказов, а также количество заказов для каждого статуса
    const total = await prisma.order.count({ where });
    const totalAllOrders = await prisma.order.count();
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    log('Fetched orders:', orders);

    //Формируем ответ с данными о заказах и связанных объектах
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
        clientType: order.tariff.clientType,
        vehicleTypes: order.tariff.vehicleTypes,
        rateType: order.tariff.rateType,
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
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    createdBy,
    tariff,
    departureTime,
    departurePoint,
    arrivalPoint,
    basePrice,
    assignedDriverId,
  } = data;

  //Валидация входных данных и логирование отсутствующих полей
  const missingFields = [];
  if (!createdBy?.uuid) missingFields.push('createdBy.uuid');
  if (!tariff?.uuid) missingFields.push('tariff.uuid');
  if (!departureTime) missingFields.push('departureTime');
  if (!departurePoint?.uuid) missingFields.push('departurePoint.uuid');
  if (!arrivalPoint?.uuid) missingFields.push('arrivalPoint.uuid');
  if (!basePrice) missingFields.push('basePrice');

  if (missingFields.length > 0) {
    log('Missing required fields:', missingFields);
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 },
    );
  }

  //Установка статуса в зависимости от наличия водителя
  const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

  try {
    //Используем транзакцию для создания заказа и связанных записей
    const result = await prisma.$transaction(async (prisma) => {
      //Проверяем, существует ли клиент
      const client = await prisma.user.findUnique({
        where: { uuid: createdBy.uuid },
      });
      if (!client) {
        throw new Error('Client not found');
      }

      //Проверяем, существует ли тариф
      const tariffRecord = await prisma.tariff.findUnique({
        where: { uuid: tariff.uuid },
      });
      if (!tariffRecord) {
        throw new Error('Tariff not found');
      }

      //Проверяем, существует ли пункт отправления
      const departurePointRecord = await prisma.point.findUnique({
        where: { uuid: departurePoint.uuid },
      });
      if (!departurePointRecord) {
        throw new Error('Departure point not found');
      }

      //Проверяем, существует ли пункт назначения
      const arrivalPointRecord = await prisma.point.findUnique({
        where: { uuid: arrivalPoint.uuid },
      });
      if (!arrivalPointRecord) {
        throw new Error('Arrival point not found');
      }

      //Создаем новый заказ и возвращаем результат
      return prisma.order.create({
        data: {
          uuid: uuidv4(),
          createdBy: { connect: { uuid: createdBy.uuid } },
          tariff: { connect: { uuid: tariff.uuid } },
          departureTime: new Date(departureTime),
          departurePoint: { connect: { uuid: departurePoint.uuid } },
          arrivalPoint: { connect: { uuid: arrivalPoint.uuid } },
          basePrice,
          status: orderStatus,
          assignedDriver: assignedDriverId ? { connect: { uuid: assignedDriverId } } : undefined,
        },
        include: {
          createdBy: true,
          tariff: true,
          departurePoint: true,
          arrivalPoint: true,
        },
      });
    });

    log('Created new order:', result);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
