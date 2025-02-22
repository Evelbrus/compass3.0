import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { Action, Order, Notification } from '@prisma/client';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { io } from 'socket.io-client';

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

function getOrderName(order: Order): string {
  return `№${order.uuid}`;
}

type NotificationTemplate = {
  title: (order: Order) => string;
  message: (order: Order, orderName: string) => string;
};

export const notificationTemplates: Record<string, NotificationTemplate> = {
  orderCreatedByAdminToAdmin: {
    title: (_order) => 'Заказ создан',
    message: (_order, orderName) => `Вы создали заказ ${orderName} для клиента.`,
  },
  orderCreatedByAdminToClient: {
    title: (_order) => 'Заказ создан',
    message: (order, orderName) =>
      `Вам создан заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderCreatedDriverAssigned: {
    title: (_order) => 'Заказ назначен',
    message: (order, orderName) =>
      `Вам назначен заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderUpdatedByAdminToAdmin: {
    title: (_order) => 'Заказ обновлён',
    message: (_order, orderName) => `Вы обновили заказ ${orderName} для клиента.`,
  },
  orderUpdatedByAdminToClient: {
    title: (_order) => 'Заказ обновлён',
    message: (order, orderName) =>
      `Ваш заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId} обновлён.`,
  },
  orderUpdatedDriverReassigned: {
    title: (_order) => 'Заказ обновлён',
    message: (_order, orderName) =>
      `Заказ ${orderName}, на который вы были назначены, был обновлён.`,
  },
  orderDriverRemoved: {
    title: (_order) => 'Назначение снято',
    message: (_order, orderName) => `Вы больше не назначены на заказ ${orderName}.`,
  },
  orderDeletedByAdminToAdmin: {
    title: (_order) => 'Заказ удалён',
    message: (_order, orderName) => `Вы удалили заказ ${orderName}.`,
  },
  orderDeletedByAdminToClient: {
    title: (_order) => 'Заказ отменён',
    message: (_order, orderName) => `Ваш заказ ${orderName} был отменён.`,
  },
  orderDeletedByAdminToDriver: {
    title: (_order) => 'Заказ отменён',
    message: (_order, orderName) =>
      `Заказ ${orderName}, на который вы были назначены, был отменён.`,
  },
  orderCreatedByCorpClientToClient: {
    title: (_order) => 'Заказ создан',
    message: (order, orderName) =>
      `Вы создали заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderCreatedByCorpClientToAdmins: {
    title: (_order) => 'Новый заказ',
    message: (order, orderName) =>
      `Корпоративный клиент создал заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderUpdatedByCorpClientToClient: {
    title: (_order) => 'Заказ обновлён',
    message: (order, orderName) =>
      `Вы обновили заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderUpdatedByCorpClientToAdmins: {
    title: (_order) => 'Заказ обновлён',
    message: (order, orderName) =>
      `Корпоративный клиент обновил заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderCancelledByCorpClientToClient: {
    title: (_order) => 'Заказ отменён',
    message: (_order, orderName) => `Вы отменили заказ ${orderName}.`,
  },
  orderCancelledByCorpClientToAdmins: {
    title: (_order) => 'Заказ отменён клиентом',
    message: (order, orderName) =>
      `Клиент отменил заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderCancelledByCorpClientToDriver: {
    title: (_order) => 'Заказ отменён',
    message: (_order, orderName) =>
      `Заказ ${orderName}, на который вы были назначены, был отменён клиентом.`,
  },
  orderStatusChangedToClient: {
    title: (_order) => 'Статус заказа изменён',
    message: (order, orderName) => `Ваш заказ ${orderName} теперь в статусе "${order.status}".`,
  },
  orderCancelledByDriverToClient: {
    title: (_order) => 'Заказ отменён',
    message: (_order, orderName) => `Ваш заказ ${orderName} был отменён водителем.`,
  },
  orderCancelledByDriverToAdmins: {
    title: (_order) => 'Заказ отменён',
    message: (order, orderName) =>
      `Водитель отменил заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
  orderInProgressDriver: {
    title: (_order) => 'Поездка начинается',
    message: (order, orderName) =>
      `Заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}. Поездка начнётся через минуту.`,
  },
  orderInProgressClient: {
    title: (_order) => 'Поездка начинается',
    message: (order, orderName) =>
      `Ваш заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId} скоро начнётся.`,
  },
  orderOverdueDriver: {
    title: (_order) => 'Просроченный заказ',
    message: (_order, orderName) => `Заказ ${orderName} просрочен.`,
  },
  orderOverdueAdmin: {
    title: (_order) => 'Просроченный заказ',
    message: (_order, orderName) =>
      `Заказ ${orderName} просрочен. Водитель не принял заказ вовремя.`,
  },
  orderOverdueAcceptedByDriverToAdmins: {
    title: (_order) => 'Просроченный заказ принят',
    message: (order, orderName) =>
      `Водитель принял просроченный заказ ${orderName} от ${order.departurePointId} до ${order.arrivalPointId}.`,
  },
};

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
                                          }: {
  userId: string;
  orderId: string;
  action: Action;
  templateKey: keyof typeof notificationTemplates;
  createdById: string;
  driverById?: string | null;
  delay?: number;
}): Promise<Notification> {
  try {
    log(`Обработка уведомления для userId: ${userId}, orderId: ${orderId}, action: ${action}`);
    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: { departurePoint: true, arrivalPoint: true },
    });
    if (!order) {
      log(`Заказ с UUID ${orderId} не найден`);
      throw new Error('Order not found');
    }
    const template = notificationTemplates[templateKey];
    if (!template) {
      log(`Шаблон ${templateKey} не найден`);
      throw new Error('Notification template not found');
    }
    const orderName = getOrderName(order);
    const title = template.title(order);
    const message = template.message(order, orderName);
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
          read: false,
          createdById,
          driverById,
          updatedAt: new Date(),
        },
      });
      log(`Уведомление ${existingNotification.uuid} обновлено для userId: ${userId}`);
    } else {
      notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          orderId,
          title,
          message,
          action,
          read: false,
          createdById,
          driverById,
        },
      });
      log(`Уведомление ${notification.uuid} создано для userId: ${userId}`);
    }
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
    if (delay > 0) {
      await orderQueue.add(
        'notification',
        { userId, orderId, action, templateKey, createdById, driverById },
        {
          delay: Math.max(delay, 0),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${notification.uuid}`,
        },
      );
      log(`Уведомление добавлено в очередь с задержкой ${delay} мс:`, notificationData);
    } else {
      connectSocket();
      socket.emit('notification', { userId, notification: notificationData });
      log(`Уведомление отправлено через WebSocket для ${userId}:`, notificationData);
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
      include: { departurePoint: true, arrivalPoint: true },
    });
    if (!order) {
      log(`Заказ с UUID ${orderId} не найден`);
      throw new Error('Order not found');
    }
    const template = notificationTemplates[templateKey];
    if (!template) {
      log(`Шаблон ${templateKey} не найден`);
      throw new Error('Notification template not found');
    }
    const orderName = getOrderName(order);
    const title = template.title(order);
    const message = template.message(order, orderName);

    // Создаем уведомления для каждого пользователя
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
              read: false,
              createdById,
              driverById,
              updatedAt: new Date(),
            },
          });
        } else {
          return prisma.notification.create({
            data: {
              uuid: uuidv4(),
              userId: user.uuid, // Указываем конкретный userId
              orderId,
              title,
              message,
              action,
              read: false,
              createdById,
              driverById,
            },
          });
        }
      })
    );

    // Отправляем уведомления через WebSocket
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
      `Массовые уведомления отправлены для ${users.length} пользователей с ролями: ${users.map((u) => u.role).join(', ')}`
    );

    // Добавьте отладку после отправки
    console.log(`Отправлено ${notifications.length} уведомлений через WebSocket`);
  } catch (error) {
    log(`Ошибка при массовой отправке уведомлений:`, error);
    throw error;
  }
}
