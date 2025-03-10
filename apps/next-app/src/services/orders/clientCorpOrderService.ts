// app/src/services/orders/createClientCorpOrder.ts
import { prisma } from '@shared/prisma/prisma-client';
import { OrderStatus, UserRole } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { CreateClientCorpOrderDTO } from '@next-app/src/dto/orders/client-corp-order.dto';
import {
  processBulkNotifications,
  processNotification,
} from '@next-app/src/services/notifications/notificationService';

const log = debug('app:services:orders:client-corp');
const logError = debug('app:services:orders:client-corp:error');

export async function createClientCorpOrder(
  clientUuid: string,
  data: CreateClientCorpOrderDTO,
): Promise<any> {
  try {
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

    log('Creating order for client:', clientUuid);
    log('Order data:', data);

    // Создание заказа в транзакции
    const result = await prisma.$transaction(async (prismaTx) => {
      log('Starting transaction for order creation');

      // Проверяем, что клиент существует и имеет роль ClientCorp
      const client = await prismaTx.user.findUnique({ where: { uuid: clientUuid } });
      if (!client) {
        logError(`Client with UUID ${clientUuid} not found`);
        throw new Error('Client not found');
      }

      const tariffRecord = await prismaTx.tariff.findUnique({ where: { uuid: tariffUuid } });
      if (!tariffRecord) {
        logError(`Tariff with UUID ${tariffUuid} not found`);
        throw new Error('Tariff not found');
      }
      log('Tariff found:', tariffRecord);

      const departurePointRecord = await prismaTx.point.findUnique({
        where: { uuid: departurePoint },
      });
      if (!departurePointRecord) {
        logError(`Departure point with UUID ${departurePoint} not found`);
        throw new Error('Departure point not found');
      }
      log('Departure point found:', departurePointRecord);

      const arrivalPointRecord = await prismaTx.point.findUnique({ where: { uuid: arrivalPoint } });
      if (!arrivalPointRecord) {
        logError(`Arrival point with UUID ${arrivalPoint} not found`);
        throw new Error('Arrival point not found');
      }
      log('Arrival point found:', arrivalPointRecord);

      // Создаем заказ
      const order = await prismaTx.order.create({
        data: {
          uuid: uuidv4(),
          clientById: clientUuid,
          tariffUuid,
          departureTime: new Date(departureTime),
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          basePrice: basePrice !== undefined ? new Decimal(basePrice) : new Decimal(0),
          status: OrderStatus.PENDING,
          intermediatePoints: (intermediatePoints || []).filter(Boolean),
          description: description || null,
          flightNumber: flightNumber || null,
          waitingTimeMinutes: waitingTimeMinutes || 0,
        },
      });
      log('Order created:', order);

      // Добавляем дополнительные услуги, если указаны
      if (selectedServices && selectedServices.length > 0) {
        log('Selected services (tariffOnServiceUuid):', selectedServices);
        const tariffOnServices = await prismaTx.tariffOnService.findMany({
          where: { uuid: { in: selectedServices } },
        });
        if (tariffOnServices.length !== selectedServices.length) {
          logError(
            `Not all services found for tariff ${tariffUuid}. Selected: ${selectedServices.join(', ')}`,
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
        log('Additional services added');
      }

      return order;
    });

    // Отправляем уведомления после транзакции
    try {
      log('Before processNotification');
      await processNotification({
        userId: clientUuid,
        orderId: result.uuid,
        templateKey: 'orderCreatedByCorpClientToClient',
        clientById: clientUuid,
      });
      log('After processNotification');

      const adminsAndOperators = await prisma.user.findMany({
        where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
      });
      log('Admins and operators fetched:', adminsAndOperators.length);
      if (adminsAndOperators.length > 0) {
        log('Before processBulkNotifications');
        await processBulkNotifications({
          users: adminsAndOperators,
          orderId: result.uuid,
          templateKey: 'orderCreatedByCorpClientToAdmins',
          clientById: clientUuid,
        });
        log('After processBulkNotifications');
      }
    } catch (notifyError) {
      log('Notification error (non-critical):', notifyError);
    }

    // Добавляем отложенные задачи в очередь
    const departureTimestamp = new Date(result.departureTime).getTime();
    const now = Date.now();
    const delay = departureTimestamp - now - 60_000;

    log(`departureTimestamp: ${departureTimestamp}, now: ${now}, delay: ${delay}`);

    if (delay <= 0) {
      log(
        `⚠️ DepartureTime (${result.departureTime}) уже меньше минуты или прошло, отправляем notification мгновенно`,
      );
      await orderQueue.add(
        'notification',
        { orderUuid: result.uuid },
        {
          delay: 0,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`⏱ Планируем checkoverdue для заказа ${result.uuid} через 1 минуту`);
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: result.uuid },
        {
          delay: 60_000, // 1 минута
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${result.uuid}`,
        },
      );
    } else {
      log(`⏱ Задача "notification" для заказа ${result.uuid} запланирована через ${delay} мс`);
      await orderQueue.add(
        'notification',
        { orderUuid: result.uuid },
        {
          delay: Math.max(delay, 0),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${result.uuid}`,
        },
      );
      log(`⏱ Планируем checkoverdue для заказа ${result.uuid} через ${delay + 60_000} мс`);
      await orderQueue.add(
        'checkoverdue',
        { orderUuid: result.uuid },
        {
          delay: delay + 60_000, // Через 1 минуту после notification
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkoverdue-${result.uuid}`,
        },
      );
    }

    return result;
  } catch (error) {
    logError('Error creating order:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
