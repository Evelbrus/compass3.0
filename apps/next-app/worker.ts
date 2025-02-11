import { Worker, Job } from 'bullmq';
import { OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
import { orderQueue } from './src/lib/queues/orderQueue.js';

dotenv.config();

export interface CheckOverdueJobData {
  order: any;
}

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};

const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  path: '/socket.io',
  autoConnect: true,
});

socket.on('connect', () => console.log('Подключено к серверу сокетов'));
socket.on('disconnect', () => console.log('Отключено от сервера сокетов'));

export const worker = new Worker(
  'orderQueue',
  async (job: Job) => {
    try {
      console.log(`Начало обработки задачи ${job.name} с ID ${job.id}`);
      switch (job.name) {
        case 'preOrderNotification':
          await processPreOrderNotificationJob(job as Job<CheckOverdueJobData>);
          break;
        case 'checkOverdue':
          await processCheckOverdueJob(job as Job<CheckOverdueJobData>);
          break;
        default:
          console.warn(`Неизвестная задача: ${job.name}`);
      }
      console.log(`Задача ${job.name} с ID ${job.id} успешно выполнена.`);
    } catch (error) {
      console.error(`Ошибка при выполнении задачи ${job?.name}:`, error);
      throw error;
    }
  },
  { connection: redisOptions },
);

worker.on('completed', (job: Job) => console.log(`Задача ${job.id} (${job.name}) выполнена`));
worker.on('failed', (job?: Job, err?: Error) => console.error(`Ошибка: ${err?.message}`));

async function processPreOrderNotificationJob(job: Job<CheckOverdueJobData>) {
  const order = job.data.order;

  //Проверяем, назначен ли водитель
  if (!order.assignedDriverId) {
    console.error(`Заказ с ID ${order.uuid} не имеет назначенного водителя.`);
    return;
  }

  //Начинаем транзакцию
  await prisma.$transaction(async (prisma) => {
    //Проверяем, есть ли уже уведомление
    let notification = await prisma.driverOrderNotification.findFirst({
      where: {
        orderId: order.uuid,
        driverId: order.assignedDriverId,
      },
    });

    if (notification) {
      //Если уведомление существует, обновляем его
      notification = await prisma.driverOrderNotification.update({
        where: { uuid: notification.uuid },
        data: {
          message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
          status: OrderStatus.PENDING,
        },
      });
      console.log(`Уведомление для заказа ${order.uuid} обновлено`);
    } else {
      //Если уведомление не существует, создаем новое
      notification = await prisma.driverOrderNotification.create({
        data: {
          orderId: order.uuid,
          driverId: order.assignedDriverId,
          title: 'Новый заказ!',
          message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
          status: OrderStatus.PENDING,
        },
      });
      console.log(`Уведомление для заказа ${order.uuid} создано`);
    }

    //Отправляем уведомление через сокет
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

    //Добавляем задачу checkOverdue с задержкой на 1 минуту до departureTime
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
        `Задача checkOverdue добавлена для заказа ${order.uuid}, на 1 минуту до departureTime`,
      );
    } else {
      console.warn(`Для заказа ${order.uuid} время для выполнения задачи checkOverdue уже прошло`);
    }
  });

  //Транзакция завершена
  console.log('Транзакция выполнена успешно');
}

async function processCheckOverdueJob(job: Job<CheckOverdueJobData>) {
  const order = job.data.order;

  //Начинаем транзакцию для обновления данных
  await prisma.$transaction(async (prisma) => {
    if (order.status !== OrderStatus.OVERDUE && new Date(order.departureTime) < new Date()) {
      //Если время выполнения заказа уже прошло, обновляем статус заказа на OVERDUE
      await prisma.order.update({
        where: { uuid: order.uuid },
        data: {
          status: OrderStatus.OVERDUE,
          driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT,
        },
      });

      //Ищем уведомление для данного заказа и водителя
      let notification = await prisma.driverOrderNotification.findFirst({
        where: {
          orderId: order.uuid,
          driverId: order.assignedDriverId,
        },
      });

      if (notification) {
        //Обновляем статус уведомления и устанавливаем isRead в false
        notification = await prisma.driverOrderNotification.update({
          where: { uuid: notification.uuid },
          data: {
            isRead: false,
          },
        });

        //Отправляем обновленное уведомление через сокет
        socket.emit('driverOrderNotification', {
          userId: order.assignedDriverId,
          notification: { ...notification, status: DriverAcceptanceStatus.TIMEOUT },
        });

        console.log(
          `Заказ ${order.uuid} обновлен до OVERDUE, уведомление обновлено, isRead установлено в false.`,
        );
      }
    } else if (new Date(order.departureTime).getTime() - Date.now() <= 60000) {
      //Если осталось меньше минуты до departureTime, отправляем уведомление за 1 минуту до отправления
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

        //Отправка через сокет
        socket.emit('driverOrderNotification', {
          userId: order.assignedDriverId,
          notification: { ...notification, status: DriverAcceptanceStatus.PENDING },
        });

        console.log(
          `Заказ ${order.uuid}: уведомление обновлено за 1 минуту до departureTime: ${notification.message}`,
        );
      }
    }
  });

  //Транзакция завершена
  console.log('Транзакция для проверки просроченного заказа выполнена успешно');
}
