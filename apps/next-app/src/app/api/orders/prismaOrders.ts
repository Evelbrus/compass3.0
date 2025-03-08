import { prisma } from '@shared/prisma/prisma-client';
import { Gender, OrderStatus, UserRole, DriverAcceptanceStatus, Order } from '@prisma/client';
import debug from 'debug';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';

const logError = debug('app:orders:error');

export async function createOrder(data: CreateOrderData, orderStatus: OrderStatus): Promise<Order> {
  const {
    createdBy: corpClientId,
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

  let createdOrder;

  try {
    createdOrder = await prisma.$transaction(async (prismaTx) => {
      let clientUuid = corpClientId;
      if (fullName && phone) {
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
      } else {
        const client = await prismaTx.user.findUnique({ where: { uuid: corpClientId } });
        if (!client) {
          logError(`× Клиент ${corpClientId} не найден (400)`);
          throw new Error('Client not found');
        }
      }

      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        logError(`× Тариф ${tariffUuid} не найден (400)`);
        throw new Error('Tariff not found');
      }

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        logError(`× Точка отправления ${departurePoint} не найдена (400)`);
        throw new Error('Departure point not found');
      }

      const arrivalPointRecord = await prismaTx.point.findUnique({ where: { uuid: arrivalPoint } });
      if (!arrivalPointRecord) {
        logError(`× Точка прибытия ${arrivalPoint} не найдена (400)`);
        throw new Error('Arrival point not found');
      }

      if (assignedDriverId) {
        const driver = await prismaTx.user.findUnique({ where: { uuid: assignedDriverId } });
        if (!driver || driver.role !== UserRole.Driver) {
          logError(`× Водитель ${assignedDriverId} не найден/не Driver (400)`);
          throw new Error('Driver not found');
        }
      }

      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
          driverAcceptanceStatus: assignedDriverId ? DriverAcceptanceStatus.PENDING : null,
        },
      });

      if (selectedServices && selectedServices.length > 0) {
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: { uuid: { in: selectedServices } },
        });
        if (tariffOnServices.length !== selectedServices.length) {
          logError(`× Не все услуги найдены для тарифа ${tariffUuid} (400)`);
          throw new Error('Not all services found for tariff');
        }
        await prismaTx.orderOnTariffAdditionalService.createMany({
          data: tariffOnServices.map((t) => ({
            uuid: uuidv4(),
            orderUuid: order.uuid,
            tariffOnServiceUuid: t.uuid,
          })),
        });
      }

      return order;
    });
  } catch (error) {
    logError('× Ошибка при создании заказа в транзакции');
    throw error; // Перебрасываем ошибку дальше для обработки в API
  }

  return createdOrder;
}

export async function getOrders(
  parsedParams: ReturnType<
    typeof parseParams<{
      page: number;
      per_page: number;
      status: OrderStatus | null;
      sort_by: 'createdAt' | 'updatedAt' | 'finalPrice' | 'departureTime';
      sort_order: 'asc' | 'desc';
    }>
  >,
) {
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
}
