//worker.ts
import { Worker } from 'bullmq';
import { OrderStatus } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
dotenv.config();
const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};
console.log('Воркер подключается к очереди orderQueue...');
//Подключаемся к серверу сокетов
const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  path: '/socket.io',
  autoConnect: true, //Автоматическое подключение
});
socket.on('connect', () => {
  console.log('Подключено к серверу сокетов');
});
socket.on('disconnect', () => {
  console.log('Отключено от сервера сокетов');
});
export const worker = new Worker(
  'orderQueue',
  async (job) => {
    try {
      console.log(`Начало обработки задачи ${job.name} с ID ${job.id}`);
      switch (job.name) {
        case 'checkOverdue':
          console.log(`Выполняется задача checkOverdue для заказа ${job.data.orderUuid}`);
          await processCheckOverdueJob(job);
          break;
        case 'notifyDriver':
          console.log(`Выполняется задача notifyDriver для заказа ${job.data.orderUuid}`);
          await processNotifyDriverJob(job);
          break;
        default:
          console.log(`Неизвестная задача: ${job.name}`);
      }
      console.log(`Задача ${job.name} с ID ${job.id} успешно выполнена.`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Задача ${job?.id} (${job?.name}) завершилась с ошибкой: ${error.message}`,
          error,
        );
      } else {
        console.error(`Задача ${job?.id} (${job?.name}) завершилась с неизвестной ошибкой:`, error);
      }
      throw error;
    }
  },
  { connection: redisOptions },
);
worker.on('completed', (job) => {
  console.log(`Задача ${job.id} (${job.name}) выполнена`);
});
worker.on('failed', (job, err) => {
  //Исправлено: job теперь может быть undefined, и err тоже
  console.error(`Задача ${job?.id} (${job?.name}) завершилась с ошибкой: ${err?.message}`);
});
console.log('Воркер подключен к очереди orderQueue.');
async function processCheckOverdueJob(job) {
  const { orderUuid } = job.data;
  try {
    console.log(`Ищем заказ с UUID: ${orderUuid}`);
    const order = await prisma.order.findUnique({ where: { uuid: orderUuid } });
    if (!order) {
      console.log(`Заказ ${orderUuid} не найден`);
      return;
    }
    const now = new Date();
    if (new Date(order.departureTime) < now && order.status !== OrderStatus.OVERDUE) {
      await prisma.order.update({
        where: { uuid: orderUuid },
        data: { status: OrderStatus.OVERDUE },
      });
      console.log(`Заказ ${orderUuid} обновлен до OVERDUE`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Ошибка при обработке заказа ${orderUuid}: ${error.message}`, error);
    } else {
      console.error(`Ошибка при обработке заказа ${orderUuid}:`, error);
    }
    throw error;
  }
}
async function processNotifyDriverJob(job) {
  const { orderUuid } = job.data;
  console.log(`Отправка уведомления водителю для заказа ${orderUuid}`);
  try {
    //1. Получаем информацию о заказе из базы данных
    const order = await prisma.order.findUnique({
      where: { uuid: orderUuid },
      include: {
        assignedDriver: true,
        departurePoint: true,
        arrivalPoint: true,
      },
    });
    if (!order) {
      console.error(`Заказ с UUID ${orderUuid} не найден`);
      return;
    }
    if (!order.assignedDriver) {
      console.error(`Для заказа с UUID ${orderUuid} не назначен водитель`);
      return;
    }
    const driver = order.assignedDriver;
    const departurePoint = order.departurePoint;
    const arrivalPoint = order.arrivalPoint;
    //2. Формируем данные для отправки уведомления
    const title = 'Скоро поездка!';
    const message = `Ваша поездка начнется через 1 минуту. От ${departurePoint?.address} до ${arrivalPoint?.address}`;
    const notificationData = {
      userId: driver.uuid,
      title: title,
      message: message,
    };
    //3. Отправляем уведомление через сокет (теперь используем socket.emit и новое событие)
    socket.emit('driverOrderNotification', { userId: driver.uuid, notification: notificationData });
    console.log(
      `Уведомление отправлено водителю ${driver.uuid} (driverOrderNotification) через WebSocket`,
    );
  } catch (error) {
    console.error(`Ошибка при обработке задачи notifyDriver для заказа ${orderUuid}:`, error);
    throw error;
  }
}
//# sourceMappingURL=worker.js.map
