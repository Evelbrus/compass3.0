// app/src/services/orders/createOrder.ts
import { prisma } from '@shared/prisma/prisma-client';
import { Gender, OrderStatus, UserRole, DriverAcceptanceStatus, Order } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { CreateOrderDTO } from '@next-app/src/dto/orders/order.dto';
import { generateOrderNumber } from '@shared/prisma/utils/generateOrderNumber';

const logError = debug('app:services:orders:error');

export async function createOrder(data: CreateOrderDTO, orderStatus: OrderStatus): Promise<Order> {
  const {
    clientBy: corpClientId,
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

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      let clientUuid = corpClientId;

      if (fullName && phone) {
        // Сначала проверяем, существует ли уже пользователь с таким телефоном
        const existingUser = await tx.user.findFirst({
          where: { phone },
        });

        if (existingUser) {
          // Обновляем существующего пользователя
          await tx.user.update({
            where: { uuid: existingUser.uuid },
            data: { fullName },
          });
          clientUuid = existingUser.uuid;
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

      const arrivalPointRecord = await tx.point.findUnique({ where: { uuid: arrivalPoint } });
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

      // Генерируем номер заказа на основе типа автомобиля и класса обслуживания из тарифа
      const orderNumber = await generateOrderNumber(
        tariffRecord.vehicleType || 'X',
        tariffRecord.serviceLevel || 'X',
      );

      const order = await tx.order.create({
        data: {
          uuid: uuidv4(),
          orderNumber, // Автоматически генерируем номер заказа
          clientById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice.toString()) : new Decimal(0),
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

      return order;
    });

    return createdOrder;
  } catch (error) {
    logError('× Ошибка при создании заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
