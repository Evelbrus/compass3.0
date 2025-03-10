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
} from '@next-app/src/services/notifications/notificationService';

dotenv.config();

// 1. Настройка подключения к Redis
const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
};

// 2. Создание очереди
export const orderQueue = new Queue('orderQueue', { connection: redisOptions });

// 3. Настройка Express и дашборда BullMQ
const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Интерфейс для данных задачи
interface CheckOverdueJobData {
  orderUuid: string;
}

// 4. Создаём воркер для обработки задач
const worker = new Worker(
  'orderQueue',
  async (job: Job<CheckOverdueJobData>) => {
    try {
      console.log(`🚀 Начало обработки задачи "${job.name}" с ID ${job.id}`);
      console.log('Данные задачи:', JSON.stringify(job.data));

      if (!job.data.orderUuid) {
        console.error('Данные задачи не содержат orderUuid:', JSON.stringify(job.data));
        await job.remove();
        throw new Error('UUID заказа отсутствует в данных задачи');
      }

      const order = await prisma.order.findUnique({
        where: { uuid: job.data.orderUuid },
        include: {
          departurePoint: true,
          arrivalPoint: true,
          assignedDriver: true,
          clientBy: true,
        },
      });

      if (!order) {
        console.error(`Заказ с UUID ${job.data.orderUuid} не найден`);
        await job.remove();
        throw new Error(`Заказ ${job.data.orderUuid} не найден`);
      }

      // Распределяем задачи по именам
      if (job.name.toLowerCase() === 'notification') {
        await processNotificationJob(order);
      } else if (job.name.toLowerCase() === 'checkoverdue') {
        await processCheckoverdueJob(order);
      } else if (job.name.toLowerCase() === 'overduecancelcheck') {
        await processOverdueCancelCheckJob(order);
      } else {
        console.warn(`⚠️ Неизвестная задача: ${job.name}`);
      }

      console.log(`✅ Задача "${job.name}" с ID ${job.id} успешно выполнена`);
    } catch (error) {
      console.error(`❌ Ошибка при выполнении задачи "${job.name}":`, error);
      throw error;
    }
  },
  { connection: redisOptions },
);

// 5. Логирование событий воркера
worker.on('completed', (job) => {
  console.log(`✅ Задача ${job.id} ("${job.name}") выполнена`);
});

worker.on('failed', (job: Job<CheckOverdueJobData> | undefined, err: Error) => {
  if (job) {
    const safeJob = job as Job<CheckOverdueJobData>; // Явное приведение типа
    console.error(`❌ Ошибка в задаче ${safeJob.id} ("${safeJob.name}"): ${err.message}`);
    console.error('Данные задачи:', JSON.stringify(safeJob.data));
  } else {
    console.error(`❌ Ошибка: ${err.message}`);
  }
});

// 6. Функция processNotificationJob - Отправляет уведомления, переводит заказ в IN_PROGRESS и меняет статус водителя на TIMEOUT
async function processNotificationJob(order: Order) {
  console.info(`🚀 Отправка уведомления inProgress для заказа ${order.uuid}`);

  try {
    await prisma.$transaction(async (prismaTx) => {
      // Важно: убедитесь, что status заказа не OVERDUE.  Если OVERDUE, уведомления отправлять не нужно.
      if (order.status !== OrderStatus.OVERDUE) {
        // Добавляем проверку!
        const fullOrder = await prismaTx.order.update({
          where: { uuid: order.uuid },
          data: {
            status: OrderStatus.IN_PROGRESS,
            driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT, // Меняем статус водителя на TIMEOUT
          },
          include: {
            departurePoint: true,
            arrivalPoint: true,
            clientBy: true,
            assignedDriver: true,
          },
        });

        console.log(`Данные заказа после обновления: ${JSON.stringify(fullOrder)}`);

        // Отправляем уведомление водителю, если есть назначенный водитель
        if (fullOrder.assignedDriverId) {
          const driverId = fullOrder.assignedDriverId;
          await processNotification({
            userId: driverId,
            orderId: fullOrder.uuid,
            templateKey: 'orderInProgressDriver',
            clientById: fullOrder.clientById,
            driverById: driverId,
          });
          console.info(`✅ Уведомление для водителя отправлено: orderInProgressDriver`);
        }

        // Отправляем уведомление клиенту
        await processNotification({
          userId: fullOrder.clientById,
          orderId: fullOrder.uuid,
          templateKey: 'orderInProgressClient',
          clientById: fullOrder.clientById,
          driverById: fullOrder.assignedDriverId,
        });
        console.info(`✅ Уведомление для клиента отправлено: orderInProgressClient`);
      } else {
        console.warn(`Заказ ${order.uuid} уже в статусе OVERDUE, уведомления не отправляются.`);
      }
    });
  } catch (error) {
    console.error(`❌ Ошибка при обработке notification для заказа ${order.uuid}:`, error);
    throw error;
  }
}

// 7. Функция processCheckoverdueJob - Проверяет просрочен ли заказ и ставит статус OVERDUE
async function processCheckoverdueJob(order: Order) {
  console.info(`🚀 Начало проверки просроченного заказа ${order.uuid}`);

  const now = new Date();

  // === ИЗМЕНЁННАЯ ЛОГИКА ПРОВЕРКИ ===
  if (order.assignedDriverId) {
    // Если заказ назначен водителю
    if (order.driverAcceptanceStatus === DriverAcceptanceStatus.TIMEOUT) {
      // Если водитель не принял заказ вовремя (TIMEOUT)
      await prisma.$transaction(async (prismaTx) => {
        // Обновляем статус заказа на OVERDUE
        const updatedOrder = await prismaTx.order.update({
          where: { uuid: order.uuid },
          data: { status: OrderStatus.OVERDUE, driverAcceptanceStatus: null }, // Сбрасываем driverAcceptanceStatus
        });
        console.info(`✅ Статус заказа ${order.uuid} обновлён на OVERDUE`);

        // Уведомления для админов и операторов
        const adminsAndOperators = await prismaTx.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });

        if (adminsAndOperators.length > 0) {
          const validUsers = adminsAndOperators.filter(
            (user) => user.uuid && typeof user.uuid === 'string',
          );
          if (validUsers.length > 0) {
            await processBulkNotifications({
              users: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
              orderId: order.uuid,
              templateKey: 'orderOverdueAdmin',
              clientById: order.clientById,
              driverById: order.assignedDriverId,
            });
            console.info(
              `✅ Уведомления для админов/операторов отправлены о просроченном заказе ${order.uuid}`,
            );
          } else {
            console.warn(`⚠️ Нет валидных пользователей для уведомления`);
          }
        } else {
          console.warn(`⚠️ Не найдено админов или операторов`);
        }

        // === [НОВОЕ] планируем задачу overdueCancelCheck через 15 минут ===
        await orderQueue.add(
          'overduecancelcheck',
          { orderUuid: updatedOrder.uuid },
          { delay: 15 * 60 * 1000 }, // 15 минут = 900000 мс
        );
        console.info(`✅ Задача overdueCancelCheck запланирована через 15 минут`);
      });
    } else if (order.driverAcceptanceStatus === DriverAcceptanceStatus.PENDING) {
      console.info(
        `ℹ️ Заказ ${order.uuid} ожидает принятия водителем (driverAcceptanceStatus: ${order.driverAcceptanceStatus})`,
      );
    } else {
      console.info(
        `ℹ️ Заказ ${order.uuid} назначен водителю, но не просрочен (driverAcceptanceStatus: ${order.driverAcceptanceStatus})`,
      );
    }
  } else {
    // Если заказ не назначен водителю, проверяем departureTime
    if (
      (order.status === OrderStatus.PENDING || order.status === OrderStatus.PLANNED) &&
      now > new Date(order.departureTime)
    ) {
      await prisma.$transaction(async (prismaTx) => {
        // Обновляем статус заказа на OVERDUE
        const updatedOrder = await prismaTx.order.update({
          where: { uuid: order.uuid },
          data: { status: OrderStatus.OVERDUE },
        });
        console.info(`✅ Статус заказа ${order.uuid} обновлён на OVERDUE`);

        // Уведомления для админов и операторов
        const adminsAndOperators = await prismaTx.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });

        if (adminsAndOperators.length > 0) {
          const validUsers = adminsAndOperators.filter(
            (user) => user.uuid && typeof user.uuid === 'string',
          );
          if (validUsers.length > 0) {
            await processBulkNotifications({
              users: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
              orderId: order.uuid,
              templateKey: 'orderOverdueAdmin',
              clientById: order.clientById,
              driverById: order.assignedDriverId,
            });
            console.info(
              `✅ Уведомления для админов/операторов отправлены о просроченном заказе ${order.uuid}`,
            );
          } else {
            console.warn(`⚠️ Нет валидных пользователей для уведомления`);
          }
        } else {
          console.warn(`⚠️ Не найдено админов или операторов`);
        }

        // === [НОВОЕ] планируем задачу overdueCancelCheck через 15 минут ===
        await orderQueue.add(
          'overduecancelcheck',
          { orderUuid: updatedOrder.uuid },
          { delay: 15 * 60 * 1000 }, // 15 минут = 900000 мс
        );
        console.info(`✅ Задача overdueCancelCheck запланирована через 15 минут`);
      });
    } else {
      console.info(
        `ℹ️ Заказ ${order.uuid} не является просроченным (статус: ${order.status}, departureTime: ${order.departureTime})`,
      );
    }
  }
}

// 8. Функция processOverdueCancelCheckJob - Отменяет заказ, если он все еще OVERDUE
async function processOverdueCancelCheckJob(order: Order) {
  console.info(`🚀 Проверка просроченного заказа для отмены ${order.uuid}`);

  // Снова подгружаем "свежий" заказ
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
    console.error(`Заказ ${order.uuid} не найден`);
    throw new Error(`Заказ ${order.uuid} не найден`);
  }

  // Если статус по-прежнему OVERDUE, то отменяем заказ
  if (freshOrder.status === OrderStatus.OVERDUE) {
    await prisma.$transaction(async (prismaTx) => {
      // Переводим заказ в CANCELLED
      const cancelledOrder = await prismaTx.order.update({
        where: { uuid: freshOrder.uuid },
        data: { status: OrderStatus.CANCELLED },
      });

      console.info(`✅ Заказ ${freshOrder.uuid} переведён в статус CANCELLED`);

      // Отправляем уведомление клиенту
      if (cancelledOrder.clientById) {
        await processNotification({
          userId: cancelledOrder.clientById,
          orderId: cancelledOrder.uuid,
          templateKey: 'orderCancelledClient',
          clientById: cancelledOrder.clientById,
          driverById: cancelledOrder.assignedDriverId,
        });
        console.info(`✅ Уведомление клиенту о CANCELLED заказе отправлено`);
      }

      // Отправляем уведомление водителю
      if (cancelledOrder.assignedDriverId) {
        await processNotification({
          userId: cancelledOrder.assignedDriverId,
          orderId: cancelledOrder.uuid,
          templateKey: 'orderCancelledDriver',
          clientById: cancelledOrder.clientById,
          driverById: cancelledOrder.assignedDriverId,
        });
        console.info(`✅ Уведомление водителю о CANCELLED заказе отправлено`);
      }

      // Если надо уведомлять админов/операторов — аналогично через bulk
      // ...
    });
  } else {
    console.info(
      `ℹ️ Заказ ${freshOrder.uuid} уже не OVERDUE (статус: ${freshOrder.status}), отмена не требуется.`,
    );
  }
}

// 9. Запуск Express-сервера и дашборда BullMQ
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Дашборд BullMQ доступен на http://localhost:${port}/admin/queues`);
});

// 10. Завершение работы при SIGTERM и SIGINT
process.on('SIGTERM', async () => {
  console.log('Получен сигнал SIGTERM, завершаем работу...');
  try {
    await worker.close();
    console.log('Воркер успешно закрыт.');
    await orderQueue.close();
    console.log('Очередь успешно закрыта.');
    await prisma.$disconnect();
    console.log('Prisma Client отключен.');
  } catch (error) {
    console.error('Ошибка при закрытии:', error);
  } finally {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  console.log('Получен сигнал SIGINT, завершаем работу...');
  try {
    await worker.close();
    console.log('Воркер успешно закрыт.');
    await orderQueue.close();
    console.log('Очередь успешно закрыта.');
    await prisma.$disconnect();
    console.log('Prisma Client отключен.');
  } catch (error) {
    console.error('Ошибка при закрытии:', error);
  } finally {
    process.exit(0);
  }
});
