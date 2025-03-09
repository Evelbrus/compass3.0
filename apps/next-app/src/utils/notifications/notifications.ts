import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { Action, Order, Notification } from '@prisma/client';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { io } from 'socket.io-client';
import { notificationTemplates } from '@next-app/src/utils/notifications/notificationTemplates';

const log = debug('app:notifications');

const socket = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN, {
  path: '/socket.io',
  transports: ['websocket'],
  autoConnect: true,
});

function connectSocket() {
  if (!socket.connected) {
    socket.connect();
    log('Установлено соединение с WebSocket-сервером');
  }
}

function getOrderName(order: Pick<Order, 'uuid'>): string {
  return `№${order.uuid}`;
}

/**
 * Универсальная функция processNotification.
 * Если уведомление для данного userId и orderId существует – обновляет его,
 * иначе создаёт новое уведомление.
 * После этого отправляет уведомление через WebSocket или помещает в очередь, если указан delay.
 */
export async function processNotification({
  userId,
  orderId,
  action,
  templateKey,
  createdById,
  driverById = null,
  delay = 0,
  markNotificationAsRead = false,
}: {
  userId: string;
  orderId: string;
  action: Action;
  templateKey: keyof typeof notificationTemplates;
  createdById: string;
  driverById?: string | null;
  delay?: number;
  markNotificationAsRead?: boolean;
}): Promise<Notification> {
  try {
    log(`Обработка уведомления для userId: ${userId}, orderId: ${orderId}, action: ${action}`);

    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        createdBy: { select: { fullName: true } },
        assignedDriver: { select: { fullName: true } },
      },
    });
    if (!order) {
      log('Заказ не найден в базе');
      throw new Error('Order not found');
    }
    log('Данные заказа получены из базы:', order.uuid);

    const departureAddress = order.departurePoint.address;
    const arrivalAddress = order.arrivalPoint.address;
    const clientFullName = order.createdBy.fullName;
    const driverFullName = order.assignedDriver?.fullName || null;
    log('Данные получены:', { departureAddress, arrivalAddress, clientFullName, driverFullName });

    const template = notificationTemplates[templateKey];
    if (!template) {
      log(`Шаблон ${templateKey} не найден`);
      throw new Error('Notification template not found');
    }
    log('Шаблон найден:', templateKey);

    const orderName = getOrderName(order);
    const title = template.title(order, departureAddress, arrivalAddress);
    const message = template.message(
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );
    log('Сформированы данные уведомления:', { title, message });

    // Устанавливаем read в зависимости от markNotificationAsRead или action
    const readValue = markNotificationAsRead || action === Action.cancelled;
    log('readValue установлен:', readValue);

    const existingNotification = await prisma.notification.findFirst({
      where: { userId, orderId },
    });
    let notification: Notification;
    if (existingNotification) {
      notification = await prisma.notification.update({
        where: { uuid: existingNotification.uuid },
        data: {
          title,
          message,
          action,
          read: readValue, // Устанавливаем актуальное значение
          createdById,
          driverById,
          updatedAt: new Date(),
        },
      });
      log('Уведомление обновлено:', notification.uuid);
    } else {
      notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          orderId,
          title,
          message,
          action,
          read: readValue, // Устанавливаем актуальное значение
          createdById,
          driverById,
        },
      });
      log('Уведомление создано:', notification.uuid);
    }

    // Формируем данные для отправки через WebSocket с актуальным read
    const notificationData = {
      uuid: notification.uuid,
      userId: notification.userId,
      orderId: notification.orderId,
      title: notification.title,
      message: notification.message,
      action: notification.action,
      read: notification.read, // Используем значение из базы
      createdById: notification.createdById,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
      driverById: notification.driverById,
    };

    if (delay > 0) {
      await orderQueue.add(
        'notification',
        { userId, orderId, action, templateKey, createdById, driverById, markNotificationAsRead },
        {
          delay: Math.max(delay, 0),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${notification.uuid}`,
        },
      );
      log('Уведомление добавлено в очередь с задержкой:', delay);
    } else {
      connectSocket();
      socket.emit('notification', { userId, notification: notificationData });
      log('Уведомление отправлено через WebSocket');
    }

    return notification;
  } catch (error) {
    log(`Ошибка при обработке уведомления для userId: ${userId}:`, error);
    throw error;
  }
}

/**
 * Универсальная функция processBulkNotifications.
 * Обрабатывает массовую отправку уведомлений для списка пользователей.
 */
export async function processBulkNotifications({
  users,
  orderId,
  action,
  templateKey,
  createdById,
  driverById = null,
}: {
  users: { uuid: string; role: string }[];
  orderId: string;
  action: Action;
  templateKey: keyof typeof notificationTemplates;
  createdById: string;
  driverById?: string | null;
}): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        createdBy: { select: { fullName: true } },
        assignedDriver: { select: { fullName: true } },
      },
    });
    if (!order) {
      log(`Заказ с UUID ${orderId} не найден`);
      throw new Error('Order not found');
    }

    const departureAddress = order.departurePoint.address;
    const arrivalAddress = order.arrivalPoint.address;
    const clientFullName = order.createdBy.fullName;
    const driverFullName = order.assignedDriver?.fullName || null;

    const template = notificationTemplates[templateKey];
    if (!template) {
      log(`Шаблон ${templateKey} не найден`);
      throw new Error('Notification template not found');
    }
    const orderName = getOrderName(order);
    const title = template.title(order, departureAddress, arrivalAddress);
    const message = template.message(
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );

    const readValue = action === Action.cancelled;
    const notifications = await Promise.all(
      users.map(async (user) => {
        const existingNotification = await prisma.notification.findFirst({
          where: { userId: user.uuid, orderId },
        });
        if (existingNotification) {
          return prisma.notification.update({
            where: { uuid: existingNotification.uuid },
            data: {
              title,
              message,
              action,
              read: readValue,
              createdById,
              driverById,
              updatedAt: new Date(),
            },
          });
        } else {
          return prisma.notification.create({
            data: {
              uuid: uuidv4(),
              userId: user.uuid,
              orderId,
              title,
              message,
              action,
              read: readValue,
              createdById,
              driverById,
            },
          });
        }
      }),
    );

    connectSocket();
    notifications.forEach((notification) => {
      const notificationData = {
        uuid: notification.uuid,
        userId: notification.userId,
        orderId: notification.orderId,
        title: notification.title,
        message: notification.message,
        action: notification.action,
        read: notification.read,
        createdById: notification.createdById,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        driverById: notification.driverById,
      };
      socket.emit('notification', {
        userId: notification.userId,
        notification: notificationData,
      });
      log(`Уведомление отправлено через WebSocket для ${notification.userId}:`, notificationData);
    });

    log(
      `Массовые уведомления отправлены для ${users.length} пользователей с ролями: ${users.map((u) => u.role).join(', ')}`,
    );
  } catch (error) {
    log(`Ошибка при массовой отправке уведомлений:`, error);
    throw error;
  }
}
