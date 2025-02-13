import { Worker } from 'bullmq';
import { OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
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
export const worker = new Worker(
  'orderQueue',
  async (job) => {
    try {
      console.log(`🚀 Начало обработки задачи ${job.name} с ID ${job.id}`);
      switch (job.name) {
        case 'preOrderNotification':
          await processPreOrderNotificationJob(job);
          break;
        case 'checkOverdue':
          await processCheckOverdueJob(job);
          break;
        default:
          console.warn(`⚠️ Неизвестная задача: ${job.name}`);
      }
      console.log(`✅ Задача ${job.name} с ID ${job.id} успешно выполнена.`);
    } catch (error) {
      console.error(`❌ Ошибка при выполнении задачи ${job?.name}:`, error);
      throw error;
    }
  },
  { connection: redisOptions },
);
worker.on('completed', (job) => console.log(`✅ Задача ${job.id} (${job.name}) выполнена`));
worker.on('failed', (job, err) => console.error(`❌ Ошибка: ${err?.message}`));
async function processPreOrderNotificationJob(job) {
  const order = job.data.order;
  if (!order.assignedDriverId) {
    console.error(`⚠️ Заказ с ID ${order.uuid} не имеет назначенного водителя.`);
    return;
  }
  await prisma.$transaction(async (prisma) => {
    let notification = await prisma.driverOrderNotification.findFirst({
      where: {
        orderId: order.uuid,
        driverId: order.assignedDriverId,
      },
    });
    if (notification) {
      notification = await prisma.driverOrderNotification.update({
        where: { uuid: notification.uuid },
        data: {
          message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
          status: OrderStatus.PENDING,
        },
      });
      console.log(`🔄 Уведомление для заказа ${order.uuid} обновлено`);
    } else {
      notification = await prisma.driverOrderNotification.create({
        data: {
          orderId: order.uuid,
          driverId: order.assignedDriverId,
          title: 'Новый заказ!',
          message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
          status: OrderStatus.PENDING,
        },
      });
      console.log(`✅ Уведомление для заказа ${order.uuid} создано`);
    }
    const notificationData = {
      uuid: notification.uuid,
      orderId: order.uuid,
      driverId: order.assignedDriverId,
      title: 'Новый заказ!',
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      status: OrderStatus.PENDING,
    };
    socket.emit('driverOrderNotification', {
      userId: order.assignedDriverId,
      notification: notificationData,
    });
    console.log('📡 Уведомление отправлено через сокет:', notificationData);
    const delay = new Date(order.departureTime).getTime() - Date.now() - 60000;
    if (delay > 0) {
      await orderQueue.add(
        'checkOverdue',
        { order },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `checkOverdue-${order.uuid}`,
          delay,
        },
      );
      console.log(
        `📅 Задача checkOverdue добавлена для заказа ${order.uuid}, на 1 минуту до departureTime`,
      );
    } else {
      console.warn(
        `⚠️ Для заказа ${order.uuid} время для выполнения задачи checkOverdue уже прошло`,
      );
    }
  });
  console.log('✅ Транзакция выполнена успешно');
}
async function processCheckOverdueJob(job) {
  const order = job.data.order;
  await prisma.$transaction(async (prisma) => {
    if (order.status !== OrderStatus.OVERDUE && new Date(order.departureTime) < new Date()) {
      await prisma.order.update({
        where: { uuid: order.uuid },
        data: {
          status: OrderStatus.OVERDUE,
          driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT,
        },
      });
      let notification = await prisma.driverOrderNotification.findFirst({
        where: {
          orderId: order.uuid,
          driverId: order.assignedDriverId,
        },
      });
      if (notification) {
        notification = await prisma.driverOrderNotification.update({
          where: { uuid: notification.uuid },
          data: {
            isRead: false,
          },
        });
        socket.emit('driverOrderNotification', {
          userId: order.assignedDriverId,
          notification: { ...notification, status: DriverAcceptanceStatus.TIMEOUT },
        });
        console.log(
          `⚠️ Заказ ${order.uuid} обновлен до OVERDUE, уведомление обновлено, isRead установлено в false.`,
        );
      }
    } else if (new Date(order.departureTime).getTime() - Date.now() <= 60000) {
      let notification = await prisma.driverOrderNotification.findFirst({
        where: {
          orderId: order.uuid,
          driverId: order.assignedDriverId,
        },
      });
      if (notification) {
        notification = await prisma.driverOrderNotification.update({
          where: { uuid: notification.uuid },
          data: {
            message: `Через 1 минуту наступит заказ, вам необходимо его взять!`,
            isRead: false,
          },
        });
        socket.emit('driverOrderNotification', {
          userId: order.assignedDriverId,
          notification: { ...notification, status: DriverAcceptanceStatus.PENDING },
        });
        console.log(
          `⏳ Заказ ${order.uuid}: уведомление обновлено за 1 минуту до departureTime: ${notification.message}`,
        );
      }
    }
  });
  console.log('✅ Транзакция для проверки просроченного заказа выполнена успешно');
}
//# sourceMappingURL=worker.js.map
