// app/src/services/orders/getOrders.ts
import { OrderStatus } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetOrdersRequestDTO, OrderResponseDTO } from '@next-app/src/dto/orders/order.dto';

const logError = debug('app:services:orders:error');

interface GetOrdersResult {
  orders: OrderResponseDTO[];
  total: number;
  totalAllOrders: number;
  statusesCount: Array<{
    status: OrderStatus;
    _count: {
      status: number;
    };
  }>;
}

export async function getOrders(
  parsedParams: ReturnType<typeof parseParams<GetOrdersRequestDTO>>,
): Promise<GetOrdersResult> {
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
        createdBy: { include: { companyProfile: true } },
        assignedDriver: {
          include: {
            vehicleDriver: {
              include: { vehicle: { select: { plateNumber: true } } },
            },
          },
        },
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        orderTariffAdditionalServices: {
          include: { tariffOnService: { include: { service: true } } },
        },
      },
    });

    const total = await prisma.order.count({ where });
    const totalAllOrders = await prisma.order.count();
    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return { orders, total, totalAllOrders, statusesCount };
  } catch (error) {
    logError('× Ошибка при получении списка заказов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
