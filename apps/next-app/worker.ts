import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Order, Action, OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import { orderQueue } from './src/lib/queues/orderQueue.js';

dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};

const socket = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN || 'http://localhost:3008', {
  transports: ['websocket'],
  path: '/socket.io',
  autoConnect: true,
});

socket.on('connect', () => console.log('✅ Подключено к серверу сокетов'));
socket.on('disconnect', () => console.log('❌ Отключено от сервера сокетов'));

//Интерфейс данных задачи – теперь передаётся только orderUuid
export interface CheckOverdueJobData {
  orderUuid: string;
}

export const worker = new Worker(
  'orderQueue',
  async (job: Job<CheckOverdueJobData>) => {
    try {
      console.log(`🚀 Начало обработки задачи "${job.name}" с ID ${job.id}`);

      //Получаем заказ по UUID из данных задачи
      const order = await prisma.order.findUnique({ where: { uuid: job.data.orderUuid } });
      if (!order) {
        throw new Error(`Заказ ${job.data.orderUuid} не найден`);
      }

      if (job.name.toLowerCase() === 'notification') {
        await processNotificationJob(order);
      } else if (job.name.toLowerCase() === 'checkoverdue') {
        await processCheckoverdueJob(order);
      } else {
        console.warn(`⚠️ Неизвестная задача: ${job.name}`);
      }

      console.log(`✅ Задача "${job.name}" с ID ${job.id} успешно выполнена.`);
    } catch (error) {
      console.error(`❌ Ошибка при выполнении задачи "${job.name}":`, error);
      throw error;
    }
  },
  { connection: redisOptions },
);

worker.on('completed', (job) => console.log(`✅ Задача ${job.id} ("${job.name}") выполнена`));

worker.on('failed', (job: Job<CheckOverdueJobData> | undefined, err: Error, prev?: string) => {
  if (job) {
    console.error(`❌ Ошибка в задаче ${job.id} ("${job.name}"): ${err.message}`);
  } else {
    console.error(`❌ Ошибка: ${err.message}`);
  }
});

//Функция для обработки задачи "notification"
async function processNotificationJob(order: Order) {
  console.log(`Отправка уведомления inProgress для заказа ${order.uuid}`);

  //Если водитель назначен, выполняем логику отправки уведомления
  if (order.assignedDriverId) {
    //Сохраняем значение в константу, чтобы гарантировать тип string
    const driverId: string = order.assignedDriverId;
    await prisma.$transaction(async (prismaTx) => {
      //Получаем адрес точки отправления (если есть)
      const departurePoint = await prismaTx.point.findUnique({
        where: { uuid: order.departurePointId },
      });
      const address = departurePoint?.address ?? 'неизвестного места';
      const newMessage = `Вам назначен новый заказ от ${address}.`;
      const desiredAction = Action.inProgress;

      let notification = await prismaTx.notification.findFirst({
        where: { orderId: order.uuid, userId: driverId },
      });

      if (notification) {
        notification = await prismaTx.notification.update({
          where: { uuid: notification.uuid },
          data: { action: desiredAction, message: newMessage, read: false },
        });
        console.log(`✅ Уведомление для заказа ${order.uuid} обновлено статусом ${desiredAction}`);
      } else {
        notification = await prismaTx.notification.create({
          data: {
            uuid: uuidv4(),
            userId: driverId,
            orderId: order.uuid,
            title: 'Новый заказ!',
            message: newMessage,
            action: desiredAction,
            read: false,
          },
        });
        console.log(`✅ Уведомление для заказа ${order.uuid} создано со статусом ${desiredAction}`);
      }

      const notificationData = {
        uuid: notification.uuid,
        orderId: order.uuid,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
        action: notification.action,
      };

      socket.emit('notification', {
        userId: driverId,
        notification: notificationData,
      });
      console.log('📡 Уведомление inProgress отправлено через сокет:', notificationData);
    });
  } else {
    console.warn(
      `Заказ ${order.uuid} не имеет назначенного водителя — уведомление не отправляется.`,
    );
  }

  //Планируем задачу "checkoverdue" в момент departureTime (независимо от наличия водителя)
  const departureTimeMs = new Date(order.departureTime).getTime();
  const now = Date.now();
  const delay = Math.max(departureTimeMs - now, 0);

  await orderQueue.add(
    'checkoverdue',
    { orderUuid: order.uuid },
    {
      delay,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      jobId: `checkoverdue-${order.uuid}`,
    },
  );
  console.log(`⏱ Задача "checkoverdue" для заказа ${order.uuid} запланирована через ${delay} мс.`);
}

//Функция для обработки задачи "checkoverdue"
async function processCheckoverdueJob(order: Order) {
  console.log(`Проверка просроченности заказа ${order.uuid} в момент departureTime`);

  const freshOrder = await prisma.order.findUnique({ where: { uuid: order.uuid } });
  if (!freshOrder) {
    console.error(`Заказ ${order.uuid} не найден в базе данных`);
    return;
  }

  //Если время departureTime прошло и заказ всё ещё PENDING или PLANNED – обновляем статус
  if (freshOrder.status === OrderStatus.PENDING || freshOrder.status === OrderStatus.PLANNED) {
    await prisma.order.update({
      where: { uuid: order.uuid },
      data: { status: OrderStatus.OVERDUE },
    });
    console.log(`✅ Статус заказа ${order.uuid} обновлен на OVERDUE`);

    //Если водитель назначен, обновляем его статус и отправляем уведомление warning
    if (order.assignedDriverId) {
      const driverId: string = order.assignedDriverId;
      await prisma.user.update({
        where: { uuid: driverId },
        data: { driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT },
      });
      console.log(`✅ Статус водителя для заказа ${order.uuid} обновлен на TIMEOUT`);

      //Получаем адрес точки отправления (если есть)
      const departurePoint = await prisma.point.findUnique({
        where: { uuid: order.departurePointId },
      });
      const address = departurePoint?.address ?? 'неизвестного места';
      const warningMessage = `Заказ от ${address} просрочен.`;

      let notification = await prisma.notification.findFirst({
        where: { orderId: order.uuid, userId: driverId },
      });

      if (notification) {
        if (notification.action !== Action.warning) {
          notification = await prisma.notification.update({
            where: { uuid: notification.uuid },
            data: { action: Action.warning, message: warningMessage, read: false },
          });
          console.log(
            `✅ Уведомление для заказа ${order.uuid} обновлено до статуса ${Action.warning}`,
          );
        } else {
          console.log(`ℹ️ Уведомление для заказа ${order.uuid} уже имеет статус ${Action.warning}`);
        }
      } else {
        notification = await prisma.notification.create({
          data: {
            uuid: uuidv4(),
            userId: driverId,
            orderId: order.uuid,
            title: 'Просроченный заказ',
            message: warningMessage,
            action: Action.warning,
            read: false,
          },
        });
        console.log(`✅ Создано новое уведомление для просроченного заказа ${order.uuid}`);
      }

      const notificationData = {
        uuid: notification.uuid,
        orderId: order.uuid,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
        action: notification.action,
      };

      socket.emit('notification', {
        userId: driverId,
        notification: notificationData,
      });
      console.log('📡 Уведомление warning отправлено через сокет:', notificationData);
    } else {
      console.log(
        `ℹ️ Для заказа ${order.uuid} водитель не назначен — обновление статуса происходит без уведомления водителя.`,
      );
    }
  } else {
    console.log(
      `ℹ️ Заказ ${order.uuid} имеет статус ${freshOrder.status}, обновление до OVERDUE не требуется.`,
    );
  }
}
