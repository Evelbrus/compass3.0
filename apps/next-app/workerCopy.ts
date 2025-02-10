import { Worker, Job } from 'bullmq';
import { OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
import { orderQueue } from './src/lib/queues/orderQueue.js';

dotenv.config();

export interface CheckOverdueJobData {
  orderUuid: string;
  checkDriverTimeout: boolean;
}

export interface NotifyDriverJobData {
  orderUuid: string;
}

export interface CheckDriverTimeoutJobData {
  orderUuid: string;
  driverId: string;
}

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};

console.log('Воркер подключается к очереди orderQueue...');

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
        case 'notifyDriver':
          await processNotifyDriverJob(job as Job<NotifyDriverJobData>);
          break;
        case 'checkDriverTimeout':
          await processCheckDriverTimeoutJob(job as Job<CheckDriverTimeoutJobData>);
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

console.log('Воркер подключен к очереди orderQueue.');

async function processCheckOverdueJob(job: Job<CheckOverdueJobData>) {
  const { orderUuid, checkDriverTimeout } = job.data;
  const order = await prisma.order.findUnique({
    where: { uuid: orderUuid },
    include: { assignedDriver: true },
  });
  if (!order) return console.log(`Заказ ${orderUuid} не найден`);
  if (new Date(order.departureTime) < new Date() && order.status !== OrderStatus.OVERDUE) {
    await prisma.order.update({
      where: { uuid: orderUuid },
      data: { status: OrderStatus.OVERDUE },
    });
    console.log(`Заказ ${orderUuid} обновлен до OVERDUE`);
    if (checkDriverTimeout && order.assignedDriverId) {
      await orderQueue.add(
        'checkDriverTimeout',
        { orderUuid, driverId: order.assignedDriverId },
        {
          delay: 600000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `driverTimeout-${orderUuid}`,
        },
      );
    }
  }
}

async function processNotifyDriverJob(job: Job<NotifyDriverJobData>) {
  const { orderUuid } = job.data;
  const order = await prisma.order.findUnique({
    where: { uuid: orderUuid },
    include: { assignedDriver: true, departurePoint: true, arrivalPoint: true },
  });
  if (!order || !order.assignedDriver)
    return console.error(`Заказ ${orderUuid} не найден или водитель не назначен`);

  const notification = await prisma.driverOrderNotification.create({
    data: {
      orderId: order.uuid,
      driverId: order.assignedDriver.uuid,
      title: 'Новый заказ!',
      message: `Вам назначен новый заказ от ${order.departurePoint?.address} до ${order.arrivalPoint?.address}.`,
      status: DriverAcceptanceStatus.PENDING,
    },
  });

  const notificationData = {
    uuid: notification.uuid,
    orderId: order.uuid,
    driverId: order.assignedDriver.uuid,
    title: 'Новый заказ!',
    message: notification.message,
    isRead: false,
    createdAt: notification.createdAt.toISOString(),
    status: DriverAcceptanceStatus.PENDING,
    type: 'action',
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

async function processCheckDriverTimeoutJob(job: Job<CheckDriverTimeoutJobData>) {
  const { orderUuid, driverId } = job.data;
  const order = await prisma.order.findUnique({ where: { uuid: orderUuid } });
  if (!order) return console.error(`Заказ ${orderUuid} не найден`);
  const notification = await prisma.driverOrderNotification.findFirst({
    where: { orderId: orderUuid, driverId },
  });
  if (!notification) return console.error(`Уведомление не найдено`);
  if (
    order.status === OrderStatus.OVERDUE &&
    order.driverAcceptanceStatus === DriverAcceptanceStatus.PENDING
  ) {
    await prisma.order.update({
      where: { uuid: orderUuid },
      data: { driverAcceptanceStatus: DriverAcceptanceStatus.REJECTED },
    });
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
