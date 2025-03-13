import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue, Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { Order, OrderStatus, UserRole, DriverAcceptanceStatus } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import {
  processBulkNotifications,
  processNotification,
  ensureSocketConnection,
} from '@next-app/src/services/notifications/notifications';
import { sendDriverTimeoutNotification } from '@next-app/src/services/notifications/sendDriverNotifications';
import { socket } from '@next-app/src/lib/websocket/websocket-client';

// Включаем детальное логирование для отладки
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log(new Date().toISOString(), ...args);
  }
}

// Вспомогательная функция для преобразования null в undefined
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

dotenv.config();

// Подключаем WebSocket при запуске BullMQ
ensureSocketConnection();
socket.on('connect', () => {
  log('BullMQ connected to WebSocket server:', socket.id);
});
socket.on('connect_error', (err) => {
  console.error('BullMQ WebSocket connection error:', err);
});
socket.on('disconnect', (reason) => {
  console.warn('BullMQ WebSocket disconnected:', reason);
  if (reason === 'io server disconnect' || reason === 'transport close') {
    setTimeout(() => ensureSocketConnection(), 5000);
  }
});

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
};

export const orderQueue = new Queue('orderQueue', { connection: redisOptions });

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

interface JobData {
  orderUuid: string;
}

const worker = new Worker(
  'orderQueue',
  async (job: Job<JobData>) => {
    try {
      if (!job.data.orderUuid) {
        throw new Error('UUID заказа отсутствует в данных задачи');
      }

      log(`[Job ${job.name}] Обработка задачи для заказа ${job.data.orderUuid}`);

      const order = await prisma.order.findUnique({
        where: { uuid: job.data.orderUuid },
        include: {
          departurePoint: true,
          arrivalPoint: true,
          clientBy: true,
          assignedDriver: true,
        },
      });

      if (!order) {
        throw new Error(`Заказ ${job.data.orderUuid} не найден`);
      }

      log(`[Job ${job.name}] Текущее состояние заказа:`, {
        uuid: order.uuid,
        status: order.status,
        driverStatus: order.driverAcceptanceStatus,
        driverId: order.assignedDriverId,
      });

      if (job.name.toLowerCase() === 'notification') {
        await processNotificationJob(order);
      } else if (job.name.toLowerCase() === 'checkoverdue') {
        await processCheckoverdueJob(order);
      } else if (job.name.toLowerCase() === 'checkcancelled') {
        await processCheckCancelledJob(order);
      }

      log(`[Job ${job.name}] Завершена обработка задачи для заказа ${job.data.orderUuid}`);
    } catch (error) {
      console.error(`[Job ${job.name}] Ошибка:`, error);
      throw error;
    }
  },
  { connection: redisOptions },
);

worker.on('completed', (job) => {
  log(`Задача ${job.name} для заказа ${job.data.orderUuid} успешно выполнена`);
});

worker.on('failed', (job, error) => {
  console.error(
    `Задача ${job?.name} для заказа ${job?.data?.orderUuid} завершилась с ошибкой:`,
    error,
  );
});

async function processNotificationJob(order: Order) {
  try {
    log(`[processNotificationJob] Обработка уведомления для заказа ${order.uuid}`);

    // Проверяем текущее состояние заказа перед изменением
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PLANNED) {
      log(
        `[processNotificationJob] Заказ ${order.uuid} уже не в статусе PENDING/PLANNED, пропускаем обработку`,
      );
      return;
    }

    await prisma.$transaction(async (prismaTx) => {
      // Обновляем статус заказа
      const updatedOrder = await prismaTx.order.update({
        where: { uuid: order.uuid },
        data: {
          status: OrderStatus.IN_PROGRESS,
          driverAcceptanceStatus: DriverAcceptanceStatus.PENDING,
        },
        include: {
          departurePoint: true,
          arrivalPoint: true,
          clientBy: true,
          assignedDriver: true,
        },
      });

      log(`[processNotificationJob] Заказ обновлен:`, {
        uuid: updatedOrder.uuid,
        status: updatedOrder.status,
        driverStatus: updatedOrder.driverAcceptanceStatus,
        driverId: updatedOrder.assignedDriverId,
      });

      if (!updatedOrder) {
        throw new Error(`Заказ ${order.uuid} не найден при обновлении`);
      }

      // Отправляем уведомление водителю, если он назначен
      if (updatedOrder.assignedDriverId) {
        log(
          `[processNotificationJob] Отправка уведомления водителю ${updatedOrder.assignedDriverId}`,
        );

        await processNotification({
          createdById: updatedOrder.assignedDriverId,
          orderId: updatedOrder.uuid,
          templateKey: 'orderInProgressDriver',
          clientId: updatedOrder.clientById,
          driverId: updatedOrder.assignedDriverId,
          markNotificationAsRead: false,
        });
      }

      // Отправляем уведомление клиенту
      log(`[processNotificationJob] Отправка уведомления клиенту ${updatedOrder.clientById}`);

      await processNotification({
        createdById: updatedOrder.clientById,
        orderId: updatedOrder.uuid,
        templateKey: 'orderInProgressClient',
        clientId: updatedOrder.clientById,
        driverId: nullToUndefined(updatedOrder.assignedDriverId),
        markNotificationAsRead: false,
      });
    });
  } catch (error) {
    console.error('[processNotificationJob] Ошибка:', error);
    throw error;
  }
}

async function processCheckoverdueJob(order: Order) {
  try {
    log(`[processCheckoverdueJob] Проверка просрочки для заказа ${order.uuid}`);

    // Получаем свежие данные о заказе
    const freshOrder = await prisma.order.findUnique({
      where: { uuid: order.uuid },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        clientBy: true,
        assignedDriver: true,
      },
    });

    if (!freshOrder) {
      throw new Error(`Заказ ${order.uuid} не найден`);
    }

    log(`[processCheckoverdueJob] Текущее состояние заказа:`, {
      uuid: freshOrder.uuid,
      status: freshOrder.status,
      driverStatus: freshOrder.driverAcceptanceStatus,
      driverId: freshOrder.assignedDriverId,
    });

    // Проверяем, нужно ли пометить заказ как просроченный
    // Заказ считается просроченным, если:
    // 1. Находится в статусе PENDING или PLANNED
    // 2. Или в статусе IN_PROGRESS с driverAcceptanceStatus = PENDING (водитель не принял заказ)
    const shouldMarkAsOverdue =
      freshOrder.status === OrderStatus.PENDING ||
      freshOrder.status === OrderStatus.PLANNED ||
      (freshOrder.status === OrderStatus.IN_PROGRESS &&
        freshOrder.driverAcceptanceStatus === DriverAcceptanceStatus.PENDING);

    if (!shouldMarkAsOverdue) {
      log(`[processCheckoverdueJob] Заказ ${freshOrder.uuid} не требует пометки как просроченный`);
      return;
    }

    // Сохраняем текущие значения для использования в уведомлениях
    const originalDriverId = freshOrder.assignedDriverId;
    const clientId = freshOrder.clientById;
    const systemUserId = process.env.SYSTEM_USER_ID || '';

    log(`[processCheckoverdueJob] Помечаем заказ ${freshOrder.uuid} как просроченный`);

    // Получаем админов и операторов до транзакции, чтобы сократить время выполнения транзакции
    const adminsAndOperators = await prisma.user.findMany({
      where: { role: { in: [UserRole.Operator, UserRole.Admin] }, availability: true },
    });

    // Увеличиваем timeout для транзакции до 30 секунд
    await prisma.$transaction(
      async (prismaTx) => {
        // Обновляем заказ: меняем статус на OVERDUE и driverAcceptanceStatus на TIMEOUT
        // Важно! Не обнуляем assignedDriverId на этом этапе
        const updatedOrder = await prismaTx.order.update({
          where: { uuid: freshOrder.uuid },
          data: {
            status: OrderStatus.OVERDUE,
            driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT,
            // НЕ обнуляем assignedDriverId здесь
          },
        });

        log(`[processCheckoverdueJob] Заказ обновлен:`, {
          uuid: updatedOrder.uuid,
          status: updatedOrder.status,
          driverStatus: updatedOrder.driverAcceptanceStatus,
          driverId: updatedOrder.assignedDriverId,
        });

        // Отправляем уведомления только если был назначен водитель
        if (originalDriverId) {
          log(
            `[processCheckoverdueJob] Отправка уведомления о таймауте водителю ${originalDriverId}`,
          );

          // Отправляем уведомление о таймауте
          await sendDriverTimeoutNotification(
            freshOrder.uuid,
            originalDriverId,
            systemUserId,
            clientId,
          );

          log(
            `[processCheckoverdueJob] Отправка уведомления о просрочке водителю ${originalDriverId}`,
          );

          // Отправляем уведомление о просрочке
          await processNotification({
            createdById: originalDriverId,
            orderId: freshOrder.uuid,
            templateKey: 'orderOverdueDriver',
            clientId: clientId,
            driverId: originalDriverId,
            markNotificationAsRead: false,
          });
        }

        // Используем предварительно полученных админов и операторов
        if (adminsAndOperators.length > 0) {
          const validUsers = adminsAndOperators.filter(
            (user) => user.uuid && typeof user.uuid === 'string',
          );

          if (validUsers.length > 0) {
            log(
              `[processCheckoverdueJob] Отправка уведомлений ${validUsers.length} админам/операторам`,
            );

            await processBulkNotifications({
              recipients: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
              orderId: freshOrder.uuid,
              templateKey: 'orderOverdueAdmin',
              driverId: nullToUndefined(originalDriverId),
              clientId: clientId,
              markNotificationAsRead: false,
            });
          }
        }

        // После отправки всех уведомлений обнуляем водителя
        if (originalDriverId) {
          log(
            `[processCheckoverdueJob] Отвязываем водителя ${originalDriverId} от заказа ${freshOrder.uuid}`,
          );

          const finalOrder = await prismaTx.order.update({
            where: { uuid: freshOrder.uuid },
            data: {
              assignedDriverId: null,
            },
          });

          log(`[processCheckoverdueJob] Заказ финально обновлен:`, {
            uuid: finalOrder.uuid,
            status: finalOrder.status,
            driverStatus: finalOrder.driverAcceptanceStatus,
            driverId: finalOrder.assignedDriverId,
          });
        }
      },
      {
        timeout: 30000, // Увеличиваем таймаут до 30 секунд
      },
    );

    // Добавляем задачу на проверку отмены через 10 минут
    await orderQueue.add(
      'checkcancelled',
      { orderUuid: freshOrder.uuid },
      {
        delay: 10 * 60 * 1000, // 10 минут
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        jobId: `checkcancelled-${freshOrder.uuid}`,
      },
    );

    log(
      `[processCheckoverdueJob] Добавлена задача на отмену заказа ${freshOrder.uuid} через 10 минут`,
    );
  } catch (error) {
    console.error('[processCheckoverdueJob] Ошибка:', error);
    throw error;
  }
}

async function processCheckCancelledJob(order: Order) {
  try {
    log(`[processCheckCancelledJob] Проверка необходимости отмены заказа ${order.uuid}`);

    // Получаем свежие данные о заказе
    const freshOrder = await prisma.order.findUnique({
      where: { uuid: order.uuid },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        clientBy: true,
        assignedDriver: true,
      },
    });

    if (!freshOrder) {
      throw new Error(`Заказ ${order.uuid} не найден`);
    }

    log(`[processCheckCancelledJob] Текущее состояние заказа:`, {
      uuid: freshOrder.uuid,
      status: freshOrder.status,
      driverStatus: freshOrder.driverAcceptanceStatus,
      driverId: freshOrder.assignedDriverId,
    });

    // Проверяем, находится ли заказ всё ещё в статусе OVERDUE
    // Если статус изменился, значит кто-то взял заказ в работу, отменять не нужно
    if (freshOrder.status !== OrderStatus.OVERDUE) {
      log(
        `[processCheckCancelledJob] Заказ ${freshOrder.uuid} уже не в статусе OVERDUE, пропускаем отмену`,
      );
      return;
    }

    log(`[processCheckCancelledJob] Отменяем просроченный заказ ${freshOrder.uuid}`);

    const clientId = freshOrder.clientById;
    const systemUserId = process.env.SYSTEM_USER_ID || '';

    // Сохраняем ID водителя (если есть) для уведомлений
    const originalDriverId = freshOrder.assignedDriverId;

    // Получаем админов и операторов до транзакции
    const adminsAndOperators = await prisma.user.findMany({
      where: { role: { in: [UserRole.Operator, UserRole.Admin] }, availability: true },
    });

    // Увеличиваем таймаут транзакции до 30 секунд
    await prisma.$transaction(
      async (prismaTx) => {
        // Обновляем заказ: устанавливаем статус CANCELLED и REJECTED
        const updatedOrder = await prismaTx.order.update({
          where: { uuid: freshOrder.uuid },
          data: {
            status: OrderStatus.CANCELLED,
            driverAcceptanceStatus: DriverAcceptanceStatus.REJECTED,
            // Не обнуляем assignedDriverId здесь - сделаем это после отправки уведомлений
          },
        });

        log(`[processCheckCancelledJob] Заказ обновлен:`, {
          uuid: updatedOrder.uuid,
          status: updatedOrder.status,
          driverStatus: updatedOrder.driverAcceptanceStatus,
          driverId: updatedOrder.assignedDriverId,
        });

        // Отправляем уведомление клиенту с указанием, что это системная отмена
        log(`[processCheckCancelledJob] Отправка уведомления клиенту ${clientId}`);

        await processNotification({
          createdById: systemUserId,
          orderId: freshOrder.uuid,
          templateKey: 'clientOrderCancelled',
          clientId: clientId,
          driverId: nullToUndefined(originalDriverId),
          markNotificationAsRead: false,
        });

        // Отправляем уведомление водителю, если он был назначен
        if (originalDriverId) {
          log(`[processCheckCancelledJob] Отправка уведомления водителю ${originalDriverId}`);

          await processNotification({
            createdById: systemUserId,
            orderId: freshOrder.uuid,
            templateKey: 'driverOrderCancelled',
            clientId: clientId,
            driverId: originalDriverId,
            markNotificationAsRead: false,
          });
        }

        // Используем предварительно полученных админов и операторов
        if (adminsAndOperators.length > 0) {
          const validUsers = adminsAndOperators.filter(
            (user) => user.uuid && typeof user.uuid === 'string',
          );

          if (validUsers.length > 0) {
            log(
              `[processCheckCancelledJob] Отправка уведомлений ${validUsers.length} админам/операторам`,
            );

            await processBulkNotifications({
              recipients: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
              orderId: freshOrder.uuid,
              templateKey: 'adminOrderCancelled',
              driverId: nullToUndefined(originalDriverId),
              clientId: clientId,
              markNotificationAsRead: false,
            });
          }
        }

        // После отправки всех уведомлений обнуляем водителя, если он был назначен
        if (originalDriverId) {
          log(
            `[processCheckCancelledJob] Отвязываем водителя ${originalDriverId} от заказа ${freshOrder.uuid}`,
          );

          const finalOrder = await prismaTx.order.update({
            where: { uuid: freshOrder.uuid },
            data: {
              assignedDriverId: null,
            },
          });

          log(`[processCheckCancelledJob] Заказ финально обновлен:`, {
            uuid: finalOrder.uuid,
            status: finalOrder.status,
            driverStatus: finalOrder.driverAcceptanceStatus,
            driverId: finalOrder.assignedDriverId,
          });
        }
      },
      {
        timeout: 30000, // Увеличиваем таймаут до 30 секунд
      },
    );
  } catch (error) {
    console.error('[processCheckCancelledJob] Ошибка:', error);
    throw error;
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  log(`BullMQ worker running on port ${port}`);
});

process.on('SIGTERM', async () => {
  log('Получен сигнал SIGTERM, закрываем соединения');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('Получен сигнал SIGINT, закрываем соединения');
  await worker.close();
  process.exit(0);
});
