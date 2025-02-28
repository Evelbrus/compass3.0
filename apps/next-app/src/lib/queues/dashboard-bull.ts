import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue, Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { Order, Action, OrderStatus, UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import {
  processBulkNotifications,
  processNotification,
} from '@next-app/src/utils/notifications/notifications';

dotenv.config();

// Настройка подключения к Redis
const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
};

// Создание очереди
export const orderQueue = new Queue('orderQueue', { connection: redisOptions });

// Настройка Express и дашборда BullMQ
const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Интерфейс для данных задачи checkoverdue
interface CheckOverdueJobData {
  orderUuid: string;
}

// Создание воркера для обработки задач
const worker = new Worker(
  'orderQueue',
  async (job: Job<CheckOverdueJobData>) => {
    try {
      console.log(`🚀 Начало обработки задачи "${job.name}" с ID ${job.id}`);
      console.log('Данные задачи:', JSON.stringify(job.data));

      if (!job.data.orderUuid) {
        console.error('Данные задачи не содержат orderUuid:', JSON.stringify(job.data));
        throw new Error('UUID заказа отсутствует в данных задачи');
      }

      const order = await prisma.order.findUnique({
        where: { uuid: job.data.orderUuid },
        include: { departurePoint: true, arrivalPoint: true },
      });

      if (!order) {
        console.error(`Заказ с UUID ${job.data.orderUuid} не найден`);
        throw new Error(`Заказ ${job.data.orderUuid} не найден`);
      }

      if (job.name.toLowerCase() === 'notification') {
        await processNotificationJob(order);
      } else if (job.name.toLowerCase() === 'checkoverdue') {
        await processCheckoverdueJob(order);
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

// Логирование событий воркера
worker.on('completed', (job) => {
  console.log(`✅ Задача ${job.id} ("${job.name}") выполнена`);
});

worker.on('failed', (job: Job<CheckOverdueJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`❌ Ошибка в задаче ${job.id} ("${job.name}"): ${err.message}`);
    console.error('Данные задачи:', JSON.stringify(job.data));
  } else {
    console.error(`❌ Ошибка: ${err.message}`);
  }
});

// Обработка задачи notification
async function processNotificationJob(order: Order) {
  console.info(`🚀 Отправка уведомления inProgress для заказа ${order.uuid}`);

  try {
    await prisma.$transaction(async (prismaTx) => {
      const fullOrder = await prismaTx.order.findUnique({
        where: { uuid: order.uuid },
        include: {
          departurePoint: true,
          arrivalPoint: true,
          createdBy: true,
          assignedDriver: true,
        },
      });

      if (!fullOrder) {
        console.error(`Заказ ${order.uuid} не найден`);
        throw new Error(`Заказ ${order.uuid} не найден`);
      }

      console.log(`Данные заказа: ${JSON.stringify(fullOrder)}`);

      if (fullOrder.assignedDriverId) {
        const driverId = fullOrder.assignedDriverId;
        await processNotification({
          userId: driverId,
          orderId: fullOrder.uuid,
          action: Action.inProgress,
          templateKey: 'orderInProgressDriver',
          createdById: fullOrder.createdById,
          driverById: driverId,
        });
        console.info(`✅ Уведомление для водителя отправлено: orderInProgressDriver`);
      }

      await processNotification({
        userId: fullOrder.createdById,
        orderId: fullOrder.uuid,
        action: Action.inProgress,
        templateKey: 'orderInProgressClient',
        createdById: fullOrder.createdById,
        driverById: fullOrder.assignedDriverId,
      });
      console.info(`✅ Уведомление для клиента отправлено: orderInProgressClient`);
    });
  } catch (error) {
    console.error(`❌ Ошибка при обработке notification для заказа ${order.uuid}:`, error);
    throw error;
  }
}

// Обработка задачи checkoverdue
async function processCheckoverdueJob(order: Order) {
  console.info(`🚀 Начало проверки просроченного заказа ${order.uuid}`);

  const freshOrder = await prisma.order.findUnique({
    where: { uuid: order.uuid },
    include: { departurePoint: true, createdBy: true, assignedDriver: true },
  });

  if (!freshOrder) {
    console.error(`Заказ ${order.uuid} не найден`);
    throw new Error(`Заказ ${order.uuid} не найден`);
  }

  const now = new Date();
  if (
    (freshOrder.status === OrderStatus.PENDING || freshOrder.status === OrderStatus.PLANNED) &&
    now > new Date(freshOrder.departureTime)
  ) {
    await prisma.$transaction(async (prismaTx) => {
      // Обновляем статус заказа на OVERDUE
      const updatedOrder = await prismaTx.order.update({
        where: { uuid: freshOrder.uuid },
        data: { status: OrderStatus.OVERDUE },
      });
      console.info(`✅ Статус заказа ${freshOrder.uuid} обновлён на OVERDUE`);

      if (freshOrder.assignedDriverId) {
        const driverId = freshOrder.assignedDriverId;
        await processNotification({
          userId: driverId,
          orderId: freshOrder.uuid,
          action: Action.warning,
          templateKey: 'orderOverdueDriver',
          createdById: freshOrder.createdById,
          driverById: driverId,
        });
        console.info(
          `✅ Уведомление для водителя отправлено о просроченном заказе ${freshOrder.uuid}`,
        );
      }

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
            orderId: freshOrder.uuid,
            action: Action.warning,
            templateKey: 'orderOverdueAdmin',
            createdById: freshOrder.createdById,
            driverById: freshOrder.assignedDriverId,
          });
          console.info(
            `✅ Уведомления для админов/операторов отправлены о просроченном заказе ${freshOrder.uuid}`,
          );
        } else {
          console.warn(`⚠️ Нет валидных пользователей для уведомления`);
        }
      } else {
        console.warn(`⚠️ Не найдено админов или операторов`);
      }
    });
  } else {
    console.info(
      `ℹ️ Заказ ${freshOrder.uuid} не является просроченным (статус: ${freshOrder.status})`,
    );
  }
}

// Запуск сервера
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Дашборд BullMQ доступен на http://localhost:${port}/admin/queues`);
});

// Обработка сигналов завершения
process.on('SIGTERM', async () => {
  console.log('Получен сигнал SIGTERM, завершаем работу...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Получен сигнал SIGINT, завершаем работу...');
  await worker.close();
  process.exit(0);
});
