import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import { Decimal } from 'decimal.js';

const log = debug('app:client-corp/orders');

interface JwtPayload {
  uuid: string;
  [key: string]: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '10', 10);
  const status = searchParams.get('status') as OrderStatus | null;
  const sortBy =
    (searchParams.get('sort_by') as 'createdAt' | 'updatedAt' | 'finalPrice') || 'createdAt';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  let token: JwtPayload | null = null;

  if (accessToken) {
    try {
      token = await verifyJWT<JwtPayload>(accessToken, authConfig.accessToken.secret);
    } catch (error) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  if (!token?.uuid) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.uuid;

  log(
    `Fetching orders for User with ID: ${userId}, page: ${page}, perPage: ${perPage}, status: ${status}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
  );

  try {
    const where: { createdById: string; status?: OrderStatus } = {
      createdById: userId,
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where,
      orderBy: {
        [sortBy]: sortOrder,
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

    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: { createdById: userId },
    });

    log(`Fetched ${orders.length} orders for User: ${userId}`);

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
    console.error('Error fetching orders for User:', error);
    return NextResponse.json(
      { status: 'error', message: `Failed to fetch orders for User: ${error}` },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let data: CreateClientCorpOrderData;
  try {
    data = await req.json();
    log('Получены данные:', data);
  } catch (error) {
    log('Ошибка разбора JSON:', error);
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

  log('Переданные selectedServices:', selectedServices);

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let token: JwtPayload | null = null;
  try {
    token = await verifyJWT<JwtPayload>(accessToken, authConfig.accessToken.secret);
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  if (!token || !token.uuid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const clientUuid = token.uuid;

  const result = await prisma.$transaction(async (prismaTx) => {
    log('Начинаем транзакцию');

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

    const order = await prismaTx.order.create({
      data: {
        uuid: uuidv4(),
        createdById: clientUuid,
        tariffUuid,
        departureTime: new Date(departureTime!),
        departurePointId: departurePoint,
        arrivalPointId: arrivalPoint,
        basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
        status: OrderStatus.PENDING,
        intermediatePoints: (intermediatePoints || []).filter(Boolean),
        description: description || null,
        flightNumber: flightNumber || null,
        waitingTimeMinutes: waitingTimeMinutes,
      },
    });
    log('Заказ создан:', order);

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

  await orderQueue.add(
    'preOrderNotification',
    { order: result },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      jobId: `preOrder-${result.uuid}`,
    },
  );

  return NextResponse.json(result, { status: 201 });
}
