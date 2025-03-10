// app/src/services/orders/getClientCorpOrders.ts
import { OrderStatus } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { Decimal } from 'decimal.js';
import {
  GetClientCorpOrdersRequestDTO,
  ClientCorpOrdersListResponseDTO,
} from '@next-app/src/dto/orders/client-corp-order.dto';

const log = debug('app:services:orders:client-corp');
const logError = debug('app:services:orders:client-corp:error');

export async function getClientCorpOrders(
  userId: string,
  params: GetClientCorpOrdersRequestDTO,
): Promise<ClientCorpOrdersListResponseDTO> {
  try {
    log(`Fetching orders for ClientCorp: ${userId}`);

    const page = params.page || 1;
    const perPage = params.per_page || 10;
    const status = params.status || null;
    // Меняем sortBy по умолчанию на departureTime
    const sortBy = params.sort_by || 'departureTime';
    // Меняем sortOrder по умолчанию на asc
    const sortOrder = params.sort_order || 'asc';

    log(
      `Fetching orders for ClientCorp ${userId}, page: ${page}, perPage: ${perPage}, status: ${status}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
    );

    const where: { clientById: string; status?: OrderStatus } = { clientById: userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        clientBy: {
          include: {
            companyProfile: true,
          },
        },
        assignedDriver: {
          include: {
            vehicleDriver: {
              include: {
                vehicle: {
                  select: {
                    plateNumber: true,
                  },
                },
              },
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

    const statusesCount = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { clientById: userId },
    });

    log(`Fetched ${orders.length} orders for ClientCorp: ${userId}`);

    // Трансформируем данные в нужный формат и правильно преобразуем типы
    const response = orders.map((order) => ({
      uuid: order.uuid,
      status: order.status,
      departureTime: order.departureTime,
      driverAcceptanceStatus: order.driverAcceptanceStatus || null,
      basePrice: order.basePrice,
      finalPrice: order.finalPrice,
      intermediatePoints: order.intermediatePoints,
      description: order.description,
      flightNumber: order.flightNumber,
      waitingTimeMinutes: order.waitingTimeMinutes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      clientBy: {
        uuid: order.clientBy.uuid,
        fullName: order.clientBy.fullName,
        email: order.clientBy.email,
        phone: order.clientBy.phone,
        role: order.clientBy.role,
        companyProfile: {
          companyName: order.clientBy.companyProfile?.companyName || null,
          companyPhone: order.clientBy.companyProfile?.phone || null,
          companyLogo: order.clientBy.companyProfile?.logoImagePath || null,
        },
      },
      assignedDriver: {
        uuid: order.assignedDriver?.uuid || null,
        plateNumber: order.assignedDriver?.vehicleDriver?.vehicle.plateNumber || null,
        fullName: order.assignedDriver?.fullName || null,
        phone: order.assignedDriver?.phone || null,
      },
      tariff: {
        uuid: order.tariff.uuid,
        name: order.tariff.name,
        vehicleType: order.tariff.vehicleType,
        serviceLevel: order.tariff.serviceLevel,
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        // Явно преобразуем к типу Decimal
        pricePerKm: order.departurePoint.pricePerKm
          ? new Decimal(order.departurePoint.pricePerKm.toString())
          : null,
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        // Явно преобразуем к типу Decimal
        pricePerKm: order.arrivalPoint.pricePerKm
          ? new Decimal(order.arrivalPoint.pricePerKm.toString())
          : null,
      },
      orderTariffAdditionalServices: order.orderTariffAdditionalServices.map((ots) => ({
        uuid: ots.uuid,
        tariffOnServiceUuid: ots.tariffOnServiceUuid,
        createdAt: ots.createdAt,
        updatedAt: ots.updatedAt,
        tariffOnService: {
          uuid: ots.tariffOnService.uuid,
          // Явно преобразуем к типу Decimal
          price: new Decimal(ots.tariffOnService.price.toString()),
          isAvailable: ots.tariffOnService.isAvailable,
          serviceUuid: ots.tariffOnService.serviceUuid,
          createdAt: ots.tariffOnService.createdAt,
          updatedAt: ots.tariffOnService.updatedAt,
          name: ots.tariffOnService.service.name,
        },
      })),
    }));

    return {
      status: 'success',
      page,
      per_page: perPage,
      total,
      statusesCount,
      orders: response,
    };
  } catch (error) {
    logError('Error fetching orders for ClientCorp:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
