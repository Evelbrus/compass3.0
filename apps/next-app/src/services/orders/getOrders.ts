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
        clientBy: { include: { companyProfile: true } },
        assignedDriver: {
          include: {
            vehicleDriver: {
              include: { vehicle: true },
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

    const formattedOrders: OrderResponseDTO[] = orders.map((order) => ({
      uuid: order.uuid,
      clientBy: {
        fullName: order.clientBy?.fullName || 'N/A',
        phone: order.clientBy?.phone || 'N/A',
        role: 'Client',
        companyProfile: order.clientBy?.companyProfile
          ? {
              companyName: order.clientBy.companyProfile.companyName,
              phone: order.clientBy.companyProfile.phone,
              logoImagePath: order.clientBy.companyProfile.logoImagePath || undefined,
            }
          : undefined,
      },
      assignedDriver: order.assignedDriver
        ? { fullname: order.assignedDriver.fullName, phone: order.assignedDriver.phone }
        : undefined,
      plateNumber: order.assignedDriver?.vehicleDriver?.vehicle?.plateNumber
        ? parseInt(order.assignedDriver.vehicleDriver.vehicle.plateNumber)
        : undefined,
      tariff: {
        name: order.tariff.name,
        vehicleType: order.tariff.vehicleType,
        serviceLevel: order.tariff.serviceLevel,
      },
      driverAcceptanceStatus: order.driverAcceptanceStatus || null,
      departurePoint: { address: order.departurePoint?.address || 'N/A' },
      arrivalPoint: { address: order.arrivalPoint?.address || 'N/A' },
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      basePrice: Number(order.basePrice),
      departureTime: order.departureTime,
    }));

    return { orders: formattedOrders, total, totalAllOrders, statusesCount };
  } catch (error) {
    logError('× Ошибка при получении списка заказов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
