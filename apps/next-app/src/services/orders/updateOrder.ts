// app/src/services/orders/updateOrder.ts
import { prisma } from '@shared/prisma/prisma-client';
import { Gender, OrderStatus, UserRole, DriverAcceptanceStatus, Order } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { CreateOrderDTO } from '@next-app/src/dto/orders/order.dto';

const logError = debug('app:services:orders:error');

export async function updateOrder(uuid: string, data: CreateOrderDTO): Promise<Order> {
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
    status: requestedStatus,
  } = data;

  try {
    if (!uuid) {
      logError('× UUID заказа отсутствует');
      throw new Error('Order UUID is required');
    }

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        createdById: true,
        assignedDriverId: true,
        status: true,
      },
    });

    if (!existingOrder) {
      logError(`× Заказ с UUID ${uuid} не найден`);
      throw new Error('Order not found');
    }

    // Определяем статус заказа
    const orderStatus = requestedStatus
      ? requestedStatus
      : assignedDriverId
        ? OrderStatus.PLANNED
        : OrderStatus.PENDING;

    // Обновляем заказ в транзакции
    const updatedOrder = await prisma.$transaction(async (tx) => {
      let clientUuid = corpClientId;

      // Обработка клиента, если переданы fullName и phone
      if (fullName && phone) {
        // Проверяем, существует ли пользователь с таким phone
        const existingUser = await tx.user.findFirst({
          where: { phone },
        });

        if (existingUser) {
          // Обновляем существующего пользователя
          const updatedUser = await tx.user.update({
            where: { uuid: existingUser.uuid },
            data: { fullName },
          });
          clientUuid = updatedUser.uuid;
        } else {
          // Создаем нового пользователя
          const newUser = await tx.user.create({
            data: {
              uuid: uuidv4(),
              fullName,
              phone,
              role: UserRole.None,
              email: `${Date.now()}@temp.com`,
              password: 'temp_password',
              gender: Gender.None,
            },
          });
          clientUuid = newUser.uuid;
        }
      } else {
        const client = await tx.user.findUnique({ where: { uuid: corpClientId } });
        if (!client) {
          logError(`× Клиент ${corpClientId} не найден (400)`);
          throw new Error('Client not found');
        }
      }

      // Проверяем связанные сущности
      const tariffRecord = await tx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        logError(`× Тариф ${tariffUuid} не найден (400)`);
        throw new Error('Tariff not found');
      }

      const departurePointRecord = await tx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        logError(`× Точка отправления ${departurePoint} не найдена (400)`);
        throw new Error('Departure point not found');
      }

      const arrivalPointRecord = await tx.point.findUnique({
        where: { uuid: arrivalPoint },
      });
      if (!arrivalPointRecord) {
        logError(`× Точка прибытия ${arrivalPoint} не найдена (400)`);
        throw new Error('Arrival point not found');
      }

      if (assignedDriverId) {
        const driver = await tx.user.findUnique({ where: { uuid: assignedDriverId } });
        if (!driver || driver.role !== UserRole.Driver) {
          logError(`× Водитель ${assignedDriverId} не найден/не Driver (400)`);
          throw new Error('Driver not found');
        }
      }

      // Обновляем заказ
      const order = await tx.order.update({
        where: { uuid },
        data: {
          createdById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice.toString()) : undefined,
          status: orderStatus,
          assignedDriverId: assignedDriverId || null,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
          driverAcceptanceStatus: assignedDriverId ? DriverAcceptanceStatus.PENDING : null,
        },
      });

      // Обновляем дополнительные услуги
      if (selectedServices) {
        // Удаляем старые услуги
        await tx.orderOnTariffAdditionalService.deleteMany({
          where: { orderUuid: uuid },
        });

        // Проверяем и добавляем новые услуги
        if (selectedServices.length > 0) {
          const tariffOnServices = await tx.tariffOnService.findMany({
            where: { uuid: { in: selectedServices } },
          });
          if (tariffOnServices.length !== selectedServices.length) {
            logError(`× Не все услуги найдены для тарифа ${tariffUuid} (400)`);
            throw new Error('Not all services found for tariff');
          }
          await tx.orderOnTariffAdditionalService.createMany({
            data: tariffOnServices.map((t) => ({
              uuid: uuidv4(),
              orderUuid: order.uuid,
              tariffOnServiceUuid: t.uuid,
            })),
          });
        }
      }

      return order;
    });

    return updatedOrder;
  } catch (error) {
    logError('× Ошибка при обновлении заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
