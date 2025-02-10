import { Worker, Job } from 'bullmq';
import { OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';

dotenv.config();

export interface CheckOverdueJobData {
  orderUuid: string;
  driverId: string | null | undefined;
  type: 'overdue' | 'preOrder';
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

async function processCheckOverdueJob(job: Job<CheckOverdueJobData>) {
  const { orderUuid, driverId, type } = job.data;
  const order = await prisma.order.findUnique({
    where: { uuid: orderUuid },
    include: { assignedDriver: true, departurePoint: true, arrivalPoint: true },
  });
  if (!order) return console.log(`Заказ ${orderUuid} не найден`);

  if (order.driverAcceptanceStatus === DriverAcceptanceStatus.PENDING && order.assignedDriverId) {
    await prisma.order.update({
      where: { uuid: orderUuid },
      data: { driverAcceptanceStatus: DriverAcceptanceStatus.REJECTED },
    });
    let notification = await prisma.driverOrderNotification.findFirst({
      where: {
        orderId: orderUuid,
        driverId: driverId !== null && driverId !== undefined ? driverId : undefined,
      },
    });

    if (notification) {
      await prisma.driverOrderNotification.update({
        where: { uuid: notification.uuid },
        data: { status: DriverAcceptanceStatus.REJECTED },
      });
      console.log(`Водитель ${driverId} не принял заказ ${orderUuid}, статус обновлен.`);
      socket.emit('driverOrderNotification', {
        userId: driverId,
        notification: { ...notification, status: DriverAcceptanceStatus.REJECTED },
      });
    }
  }

  //Проверяем, что за тип уведомления и делаем нужные вещи
  if (type === 'overdue') {
    if (new Date(order.departureTime) < new Date() && order.status !== OrderStatus.OVERDUE) {
      await prisma.order.update({
        where: { uuid: orderUuid },
        data: { status: OrderStatus.OVERDUE },
      });

      //Попытка найти существующее уведомление
      let notification = await prisma.driverOrderNotification.findFirst({
        where: {
          orderId: order.uuid,
          driverId: order.assignedDriverId || undefined,
        },
      });

      //Если существует - обновляем
      if (notification) {
        await prisma.driverOrderNotification.update({
          where: { uuid: notification.uuid },
          data: {
            status: DriverAcceptanceStatus.REJECTED,
          },
        });
        console.log(`Уведомление ${notification.uuid} обновлено, статус Overdue`);

        socket.emit('driverOrderNotification', {
          userId: driverId,
          notification: {
            ...notification,
            status: DriverAcceptanceStatus.REJECTED,
          },
        });
      }

      console.log(`Заказ ${orderUuid} обновлен до OVERDUE и уведомление обновлен`);
    }
  } else if (type === 'preOrder') {
    if (!order.assignedDriver)
      return console.error(`Заказ ${orderUuid} не найден или водитель не назначен`);

    //Попытка найти существующее уведомление
    let notification = await prisma.driverOrderNotification.findFirst({
      where: {
        orderId: order.uuid,
        driverId: order.assignedDriver.uuid,
      },
    });

    if (notification) {
      //Уведомление существует, обновляем его
      await prisma.driverOrderNotification.update({
        where: { uuid: notification.uuid },
        data: {
          message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
          status: DriverAcceptanceStatus.PENDING,
        },
      });
      console.log(`Уведомление ${notification.uuid} обновлено`);
    } else {
      //Уведомление не существует, создаем новое
      const createNotificationData = {
        orderId: order.uuid,
        driverId: order.assignedDriver.uuid,
        title: 'Новый заказ!',
        message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
        status: DriverAcceptanceStatus.PENDING,
      };
      notification = await prisma.driverOrderNotification.create({
        data: createNotificationData,
      });
      console.log(`Уведомление ${notification.uuid} создано`);
    }

    const notificationData = {
      uuid: notification.uuid,
      orderId: order.uuid,
      driverId: order.assignedDriver.uuid,
      title: 'Новый заказ!',
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      status: DriverAcceptanceStatus.PENDING,
      type: type,
    };

    socket.emit('driverOrderNotification', {
      userId: order.assignedDriver.uuid,
      notification: notificationData,
    });
    console.log('📡 Уведомление отправлено через сокет:', {
      userId: order.assignedDriver.uuid,
      notification: notificationData,
    });
  }
}
