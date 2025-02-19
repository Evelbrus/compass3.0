import { NextResponse } from 'next/server';
import { Gender, OrderStatus, UserRole, DriverAcceptanceStatus } from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { prisma } from '@shared/prisma/prisma-client';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';

const log = debug('app:orders');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    status: searchParams.get('status') as OrderStatus | null,
    sort_by:
      (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
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

export async function POST(req: Request) {
  let data: CreateOrderData;
  try {
    data = await req.json();
    log('Получены данные:', data);
  } catch (error) {
    log('Ошибка разбора JSON:', error);
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
    description,
    flightNumber,
    waitingTimeMinutes,
    fullName,
    phone,
  } = data;

  const orderStatus = assignedDriverId ? OrderStatus.PLANNED : OrderStatus.PENDING;

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Начинаем транзакцию');

      let clientUuid = createdBy;
      if (fullName && phone) {
        log('Создаем нового временного пользователя');
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
        log('Новый временный пользователь создан:', newUser);
      } else {
        const client = await prismaTx.user.findUnique({
          where: { uuid: createdBy },
        });
        if (!client) {
          log(`Клиент с UUID ${createdBy} не найден`);
          throw new Error('Client not found');
        }
        log('Клиент найден:', client);
      }

      const tariffRecord = await prismaTx.tariff.findUnique({
        where: { uuid: tariffUuid },
      });
      if (!tariffRecord) {
        log(`Тариф с UUID ${tariffUuid} не найден`);
        throw new Error('Tariff not found');
      }
      log('Тариф найден:', tariffRecord);

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        log(`Точка отправления с UUID ${departurePoint} не найдена`);
        throw new Error('Departure point not found');
      }
      log('Точка отправления найдена:', departurePointRecord);

      const arrivalPointRecord = await prismaTx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) {
        log(`Точка прибытия с UUID ${arrivalPoint} не найдена`);
        throw new Error('Arrival point not found');
      }
      log('Точка прибытия найдена:', arrivalPointRecord);

      if (assignedDriverId) {
        const driver = await prismaTx.user.findUnique({
          where: { uuid: assignedDriverId },
        });
        if (!driver) {
          log(`Водитель с UUID ${assignedDriverId} не найден`);
          throw new Error('Driver not found');
        }
        log('Водитель найден:', driver);
      }

      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime!),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes,
        },
      });
      log('Заказ создан:', order);

      if (assignedDriverId) {
        await prismaTx.user.update({
          where: { uuid: assignedDriverId },
          data: { driverAcceptanceStatus: DriverAcceptanceStatus.PENDING },
        });
        log(`driverAcceptanceStatus обновлён для водителя с UUID ${assignedDriverId}`);
      }

      if (selectedServices && selectedServices.length > 0) {
        log('Выбранные услуги (tariffOnServiceUuid):', selectedServices);
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: {
            uuid: { in: selectedServices },
          },
        });
        if (tariffOnServices.length !== selectedServices.length) {
          log(
            `Не все услуги найдены для тарифа ${tariffUuid}. Выбранные услуги: ${selectedServices.join(', ')}`,
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
        log('Дополнительные услуги добавлены');
      }

      return order;
    });

    if (!result.uuid) {
      throw new Error('Созданный заказ не содержит UUID');
    }

    const departureTimestamp = new Date(result.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60000;

    await orderQueue.add(
      'notification',
      { orderUuid: result.uuid },
      {
        delay: delay > 0 ? delay : 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        jobId: `notification-${result.uuid}`,
      },
    );

    console.log(`📌 Задача notification добавлена, jobId: notification-${result.uuid}`);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Ошибка создания заказа:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}
