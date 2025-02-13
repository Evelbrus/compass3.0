import { NextResponse, NextRequest } from 'next/server';
import { OrderStatus } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { ACCESS_TOKEN_COOKIE } from '@shared/utils/cookie';
import { authConfig } from '@shared/utils/cookie/get-cookie/auth';
import { verifyJWT } from '@shared/utils/parse-jwt/parseJwt';

const log = debug('app:drivers/orders');

//Define a type for the JWT payload
interface JwtPayload {
  uuid: string;
  [key: string]: string;
}

//GET: Получение заказов для конкретного водителя с пагинацией, фильтрацией и сортировкой
//Путь: /api/drivers/orders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  let token: JwtPayload | null = null;

  if (accessToken) {
    try {
      token = await verifyJWT<JwtPayload>(accessToken, authConfig.accessToken.secret);
    } catch (error) {
      console.error('Token verification failed:', error);
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
    const where: { status?: OrderStatus; assignedDriverId: string } = {
      assignedDriverId: token.uuid,
    };
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
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: { assignedDriverId: token.uuid },
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
      statusesCount,
      orders: response,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Unable to fetch orders' }, { status: 500 });
  }
}
