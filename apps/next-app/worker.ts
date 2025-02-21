import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  Action,
  OrderStatus,
  DriverAcceptanceStatus,
  DriverStatus,
  UserRole,
} from '@prisma/client';
import { orderQueue } from './src/lib/queues/orderQueue.js';
import { socket } from './src/socket-server.js';

dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};

//Логи подключения уже определены в @socket/server, но можно добавить дополнительные проверки
socket.on('connect', () => console.log('✅ Worker подключён к серверу сокетов'));
socket.on('disconnect', () => console.log('❌ Worker отключён от сервера сокетов'));

export interface CheckOverdueJobData {
  orderUuid: string;
}

export const worker = new Worker(
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
    console.error('Данные задачи:', JSON.stringify(job.data));
  } else {
    console.error(`❌ Ошибка: ${err.message}`);
  }
});

async function processNotificationJob(order: Order) {
  console.log(`Отправка уведомления inProgress для заказа ${order.uuid}`);

  await prisma.$transaction(async (prismaTx) => {
    const departurePoint = await prismaTx.point.findUnique({
      where: { uuid: order.departurePointId },
    });
    const arrivalPoint = await prismaTx.point.findUnique({
      where: { uuid: order.arrivalPointId },
    });
    const depAddress = departurePoint?.address ?? 'неизвестного места';
    const arrAddress = arrivalPoint?.address ?? 'неизвестного места';

    //Уведомление водителю
    if (order.assignedDriverId) {
      const userId: string = order.assignedDriverId;
      const newMessage = `Вам назначен заказ от ${depAddress} до ${arrAddress}. Поездка начнётся через минуту.`;
      const desiredAction = Action.inProgress;

      await prismaTx.user.update({
        where: { uuid: userId },
        data: { driverStatus: DriverStatus.BUSY },
      });

      await prismaTx.order.update({
        where: { uuid: order.uuid },
        data: { driverAcceptanceStatus: DriverAcceptanceStatus.TAKEN },
      });

      let driverNotification = await prismaTx.notification.findFirst({
        where: { orderId: order.uuid, userId: userId },
      });

      if (driverNotification) {
        driverNotification = await prismaTx.notification.update({
          where: { uuid: driverNotification.uuid },
          data: { action: desiredAction, message: newMessage, read: false },
        });
        console.log(`✅ Уведомление для водителя обновлено статусом ${desiredAction}`);
      } else {
        driverNotification = await prismaTx.notification.create({
          data: {
            uuid: uuidv4(),
            userId: userId,
            orderId: order.uuid,
            title: 'Поездка начинается',
            message: newMessage,
            action: desiredAction,
            read: false,
            createdById: order.createdById,
          },
        });
        console.log(`✅ Уведомление для водителя создано со статусом ${desiredAction}`);
      }

      const driverNotificationData = {
        uuid: driverNotification.uuid,
        userId: userId,
        orderId: order.uuid,
        title: driverNotification.title,
        message: driverNotification.message,
        read: driverNotification.read,
        createdById: order.createdById,
        createdAt: driverNotification.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: driverNotification.updatedAt?.toISOString() || new Date().toISOString(),
        action: driverNotification.action,
      };

      socket.emit('notification', {
        userId: userId,
        notification: driverNotificationData,
      });
      console.log(
        '📡 Уведомление inProgress отправлено водителю через сокет:',
        driverNotificationData,
      );
    } else {
      console.warn(
        `Заказ ${order.uuid} не имеет назначенного водителя — уведомление водителю не отправлено.`,
      );
    }

    //Уведомление клиенту
    const clientMessage = `Ваш заказ от ${depAddress} до ${arrAddress} скоро начнётся.`;
    let clientNotification = await prismaTx.notification.findFirst({
      where: { orderId: order.uuid, userId: order.createdById },
    });

    if (clientNotification) {
      clientNotification = await prismaTx.notification.update({
        where: { uuid: clientNotification.uuid },
        data: { action: Action.inProgress, message: clientMessage, read: false },
      });
      console.log(`✅ Уведомление для клиента обновлено статусом inProgress`);
    } else {
      clientNotification = await prismaTx.notification.create({
        data: {
          uuid: uuidv4(),
          userId: order.createdById,
          orderId: order.uuid,
          title: 'Поездка начинается',
          message: clientMessage,
          action: Action.inProgress,
          read: false,
          createdById: order.createdById,
        },
      });
      console.log(`✅ Уведомление для клиента создано со статусом inProgress`);
    }

    const clientNotificationData = {
      uuid: clientNotification.uuid,
      userId: order.createdById,
      orderId: order.uuid,
      title: clientNotification.title,
      message: clientNotification.message,
      read: clientNotification.read,
      createdById: order.createdById,
      createdAt: clientNotification.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: clientNotification.updatedAt?.toISOString() || new Date().toISOString(),
      action: clientNotification.action,
    };

    socket.emit('notification', {
      userId: order.createdById,
      notification: clientNotificationData,
    });
    console.log(
      '📡 Уведомление inProgress отправлено клиенту через сокет:',
      clientNotificationData,
    );

    //Планируем задачу checkoverdue
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
    console.log(
      `⏱ Задача "checkoverdue" для заказа ${order.uuid} запланирована через ${delay} мс.`,
    );
  });
}

async function processCheckoverdueJob(order: Order) {
  const freshOrder = await prisma.order.findUnique({
    where: { uuid: order.uuid },
    include: { departurePoint: true },
  });
  if (!freshOrder) return;

  if (freshOrder.status === OrderStatus.PENDING || freshOrder.status === OrderStatus.PLANNED) {
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.order.update({
        where: { uuid: order.uuid },
        data: {
          status: OrderStatus.OVERDUE,
          driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT,
        },
      });

      const departurePoint = await prismaTx.point.findUnique({
        where: { uuid: order.departurePointId },
      });
      const address = departurePoint?.address ?? 'неизвестного места';
      const warningMessage = `Заказ от ${address} просрочен.`;

      if (order.assignedDriverId) {
        const userId = order.assignedDriverId;
        await prismaTx.user.update({
          where: { uuid: userId },
          data: { driverStatus: DriverStatus.FREE },
        });

        let notification = await prismaTx.notification.findFirst({
          where: { orderId: order.uuid, userId: userId },
        });

        if (notification) {
          notification = await prismaTx.notification.update({
            where: { uuid: notification.uuid },
            data: { action: Action.warning, message: warningMessage, read: false },
          });
          console.log(`✅ Уведомление для водителя обновлено до warning для заказа ${order.uuid}`);
        } else {
          notification = await prismaTx.notification.create({
            data: {
              uuid: uuidv4(),
              userId: userId,
              orderId: order.uuid,
              title: 'Просроченный заказ',
              message: warningMessage,
              action: Action.warning,
              read: false,
              createdById: order.createdById,
            },
          });
          console.log(`✅ Создано новое уведомление warning для водителя для заказа ${order.uuid}`);
        }

        const notificationData = {
          uuid: notification.uuid,
          userId: userId,
          orderId: order.uuid,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          createdById: order.createdById,
          createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: notification.updatedAt?.toISOString() || new Date().toISOString(),
          action: notification.action,
        };

        socket.emit('notification', {
          userId: userId,
          notification: notificationData,
        });
      }

      const adminsAndOperators = await prismaTx.user.findMany({
        where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
      });

      for (const user of adminsAndOperators) {
        let notification = await prismaTx.notification.findFirst({
          where: { orderId: order.uuid, userId: user.uuid },
        });

        if (notification) {
          notification = await prismaTx.notification.update({
            where: { uuid: notification.uuid },
            data: {
              title: 'Просроченный заказ',
              message: `Заказ от ${address} просрочен. Водитель не принял заказ вовремя.`,
              action: Action.warning,
              read: false,
            },
          });
          console.log(`✅ Уведомление для ${user.role} ${user.uuid} обновлено до warning`);
        } else {
          notification = await prismaTx.notification.create({
            data: {
              uuid: uuidv4(),
              userId: user.uuid,
              orderId: order.uuid,
              title: 'Просроченный заказ',
              message: `Заказ от ${address} просрочен. Водитель не принял заказ вовремя.`,
              action: Action.warning,
              read: false,
              createdById: order.createdById,
            },
          });
          console.log(`✅ Создано новое уведомление warning для ${user.role} ${user.uuid}`);
        }

        const notificationData = {
          uuid: notification.uuid,
          userId: user.uuid,
          orderId: order.uuid,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          createdById: order.createdById,
          createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: notification.updatedAt?.toISOString() || new Date().toISOString(),
          action: notification.action,
        };

        socket.emit('notification', {
          userId: user.uuid,
          notification: notificationData,
        });
        console.log(`📡 Уведомление для ${user.role} ${user.uuid} отправлено:`, notificationData);
      }
    });
  }
}
