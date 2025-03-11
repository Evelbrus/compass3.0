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
  socket,
  ensureSocketConnection,
} from '@next-app/src/services/notifications/notifications';
import { sendDriverTimeoutNotification } from '@next-app/src/services/notifications/sendDriverNotifications';

dotenv.config();

// Подключаем WebSocket при запуске BullMQ
ensureSocketConnection();
socket.on('connect', () => {
  console.log('BullMQ connected to WebSocket server:', socket.id);
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

      const order = await prisma.order.findUnique({
        where: { uuid: job.data.orderUuid },
        include: { departurePoint: true, arrivalPoint: true },
      });

      if (!order) {
        throw new Error(`Заказ ${job.data.orderUuid} не найден`);
      }

      if (job.name.toLowerCase() === 'notification') {
        await processNotificationJob(order);
      } else if (job.name.toLowerCase() === 'checkoverdue') {
        await processCheckoverdueJob(order);
      } else if (job.name.toLowerCase() === 'checkcancelled') {
        await processCheckCancelledJob(order);
      }
    } catch (error) {
      throw error;
    }
  },
  { connection: redisOptions },
);

worker.on('completed', () => {});
worker.on('failed', () => {});

async function processNotificationJob(order: Order) {
  try {
    await prisma.$transaction(async (prismaTx) => {
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

      if (!updatedOrder) {
        throw new Error(`Заказ ${order.uuid} не найден`);
      }

      if (updatedOrder.assignedDriverId) {
        await processNotification({
          createdById: updatedOrder.assignedDriverId,
          orderId: updatedOrder.uuid,
          templateKey: 'orderInProgressDriver',
          clientId: updatedOrder.clientById,
          driverId: updatedOrder.assignedDriverId,
          markNotificationAsRead: false,
        });
      }

      await processNotification({
        createdById: updatedOrder.clientById,
        orderId: updatedOrder.uuid,
        templateKey: 'orderInProgressClient',
        clientId: updatedOrder.clientById,
        driverId: updatedOrder.assignedDriverId || undefined,
        markNotificationAsRead: false,
      });
    });
  } catch (error) {
    throw error;
  }
}

async function processCheckoverdueJob(order: Order) {
  const freshOrder = await prisma.order.findUnique({
    where: { uuid: order.uuid },
    include: { departurePoint: true, clientBy: true, assignedDriver: true },
  });

  if (!freshOrder) {
    throw new Error(`Заказ ${order.uuid} не найден`);
  }

  if (
    freshOrder.status === OrderStatus.PENDING ||
    freshOrder.status === OrderStatus.PLANNED ||
    (freshOrder.status === OrderStatus.IN_PROGRESS &&
      freshOrder.driverAcceptanceStatus === DriverAcceptanceStatus.PENDING)
  ) {
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.order.update({
        where: { uuid: freshOrder.uuid },
        data: {
          status: OrderStatus.OVERDUE,
          driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT,
        },
      });

      if (freshOrder.assignedDriverId) {
        const driverId = freshOrder.assignedDriverId;
        const systemUserId = process.env.SYSTEM_USER_ID;

        await sendDriverTimeoutNotification(
          freshOrder.uuid,
          driverId,
          systemUserId || '',
          freshOrder.clientById,
        );

        await processNotification({
          createdById: driverId,
          orderId: freshOrder.uuid,
          templateKey: 'orderOverdueDriver',
          clientId: freshOrder.clientById,
          driverId: driverId,
          markNotificationAsRead: false,
        });
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
            recipients: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
            orderId: freshOrder.uuid,
            templateKey: 'orderOverdueAdmin',
            markNotificationAsRead: false,
          });
        }
      }

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
    });
  }
}

async function processCheckCancelledJob(order: Order) {
  const freshOrder = await prisma.order.findUnique({
    where: { uuid: order.uuid },
    include: { departurePoint: true, clientBy: true, assignedDriver: true },
  });

  if (!freshOrder) {
    throw new Error(`Заказ ${order.uuid} не найден`);
  }

  if (freshOrder.status === OrderStatus.OVERDUE) {
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.order.update({
        where: { uuid: freshOrder.uuid },
        data: {
          status: OrderStatus.CANCELLED,
          driverAcceptanceStatus: DriverAcceptanceStatus.REJECTED,
        },
      });

      await processNotification({
        createdById: freshOrder.clientById,
        orderId: freshOrder.uuid,
        templateKey: 'clientOrderCancelled',
        clientId: freshOrder.clientById,
        driverId: freshOrder.assignedDriverId || undefined,
        markNotificationAsRead: false,
      });

      if (freshOrder.assignedDriverId) {
        const driverId = freshOrder.assignedDriverId;

        await processNotification({
          createdById: driverId,
          orderId: freshOrder.uuid,
          templateKey: 'driverOrderCancelled',
          clientId: freshOrder.clientById,
          driverId: driverId,
          markNotificationAsRead: false,
        });
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
            recipients: validUsers.map((user) => ({ uuid: user.uuid, role: user.role })),
            orderId: freshOrder.uuid,
            templateKey: 'adminOrderCancelled',
            markNotificationAsRead: false,
          });
        }
      }
    });
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`BullMQ worker running on port ${port}`);
});

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});
