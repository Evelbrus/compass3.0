import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { Action, Order, Notification, OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
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

const orderStatusTranslations: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  PLANNED: 'Запланирован',
  IN_PROGRESS: 'В процессе выполнения',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
  OVERDUE: 'Просрочен',
};

const driverAcceptanceStatusTranslations: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидает решения водителя',
  TAKEN: 'Принят к сведению водителем',
  ACCEPTED: 'Принят водителем',
  ON_THE_WAY: 'Водитель в пути к клиенту',
  ARRIVED: 'Водитель прибыл к клиенту',
  PICKED_UP: 'Водитель забрал клиента',
  TIMEOUT: 'Водитель не принял вовремя',
  COMPLETED: 'Поездка завершена',
};

interface OrderWithDetails extends Order {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  createdBy: { fullName: string };
  assignedDriver: { fullName: string } | null;
}

function getOrderName(order: Pick<Order, 'uuid'>): string {
  return `№${order.uuid}`;
}

type NotificationTemplate = {
  title: (order: OrderWithDetails, departureAddress: string, arrivalAddress: string) => string;
  message: (
    order: OrderWithDetails,
    orderName: string,
    departureAddress: string,
    arrivalAddress: string,
    clientFullName?: string,
    driverFullName?: string | null,
  ) => string;
};

export const notificationTemplates: Record<string, NotificationTemplate> = {
  orderCreatedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `Вы создали заказ ${orderName} для клиента ${clientFullName} от ${departureAddress} до ${arrivalAddress}. ${driverFullName ? `Назначен водитель: ${driverFullName}.` : 'Водитель не назначен.'} Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderCreatedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вам создан заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderCreatedDriverAssigned: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ назначен',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вам назначен заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderUpdatedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName, driverFullName) =>
      `Вы обновили заказ ${orderName} для клиента ${clientFullName} от ${departureAddress} до ${arrivalAddress}. ${driverFullName ? `Назначен водитель: ${driverFullName}.` : 'Водитель не назначен.'} Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderUpdatedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Ваш заказ ${orderName} от ${departureAddress} до ${arrivalAddress} обновлён. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderUpdatedDriverReassigned: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress}, на который вы были назначены, был обновлён. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderDriverRemoved: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Назначение снято',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вы больше не назначены на заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления было: ${order.departureTime.toLocaleString()}.`,
  },
  orderDeletedByAdminToAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ удалён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `Вы удалили заказ ${orderName} от ${departureAddress} до ${arrivalAddress}.`,
  },
  orderDeletedByAdminToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `Ваш заказ ${orderName} от ${departureAddress} до ${arrivalAddress} был отменён.`,
  },
  orderDeletedByAdminToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress}, на который вы были назначены, был отменён.`,
  },
  orderCreatedByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ создан',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вы создали заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderCreatedByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Новый заказ',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `Корпоративный клиент ${clientFullName} создал заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderUpdatedByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вы обновили заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderUpdatedByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ обновлён',
    message: (order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `Корпоративный клиент ${clientFullName} обновил заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderCancelledByCorpClientToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `Вы отменили заказ ${orderName} от ${departureAddress} до ${arrivalAddress}.`,
  },
  orderCancelledByDriverToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress) =>
      `Вы отменили заказ ${orderName} от ${departureAddress} до ${arrivalAddress}.`,
  },
  orderCancelledByCorpClientToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён клиентом',
    message: (_order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `Корпоративный клиент ${clientFullName} отменил заказ ${orderName} от ${departureAddress} до ${arrivalAddress}.`,
  },
  orderCancelledByCorpClientToDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (_order, orderName, departureAddress, arrivalAddress, clientFullName) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress}, на который вы были назначены, был отменён клиентом ${clientFullName}.`,
  },
  orderStatusChangedToClient: {
    title: (order, _departureAddress, _arrivalAddress) =>
      order.status === 'COMPLETED' ? 'Поездка успешно завершена' : 'Статус заказа изменён',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Ваш заказ ${orderName} от ${departureAddress} до ${arrivalAddress} теперь в статусе "${orderStatusTranslations[order.status]}". ${driverFullName ? `Статус водителя: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}".` : ''} Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderCancelledByDriverToClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (
      _order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Ваш заказ ${orderName} от ${departureAddress} до ${arrivalAddress} был отменён водителем ${driverFullName || 'не указан'}.`,
  },
  orderCancelledByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Заказ отменён',
    message: (
      _order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Водитель ${driverFullName || 'не указан'} отменил заказ ${orderName} от ${departureAddress} до ${arrivalAddress}.`,
  },
  orderInProgressDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Поездка начинается',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      _driverFullName,
    ) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress} в статусе "${orderStatusTranslations[order.status]}". Ваш текущий статус: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}". Время отправления: ${order.departureTime.toLocaleString()}. Поездка начнётся через минуту.`,
  },
  orderInProgressClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Поездка начинается',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Ваш заказ ${orderName} от ${departureAddress} до ${arrivalAddress} в статусе "${orderStatusTranslations[order.status]}". Водитель: ${driverFullName || 'не указан'}. Статус водителя: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'PENDING']}". Время отправления: ${order.departureTime.toLocaleString()}. Поездка скоро начнётся.`,
  },
  orderOverdueDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress} просрочен. Ваш статус: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'TIMEOUT']}". Время отправления было: ${order.departureTime.toLocaleString()}.`,
  },
  orderOverdueAdmin: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Заказ ${orderName} от ${departureAddress} до ${arrivalAddress} просрочен. Водитель ${driverFullName || 'не указан'} не принял заказ вовремя (статус: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'TIMEOUT']}"). Время отправления было: ${order.departureTime.toLocaleString()}.`,
  },
  orderOverdueAcceptedByDriverToAdmins: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Просроченный заказ принят',
    message: (
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      _clientFullName,
      driverFullName,
    ) =>
      `Водитель ${driverFullName || 'не указан'} принял просроченный заказ ${orderName} от ${departureAddress} до ${arrivalAddress}. Статус водителя: "${driverAcceptanceStatusTranslations[order.driverAcceptanceStatus || 'ACCEPTED']}". Время отправления было: ${order.departureTime.toLocaleString()}.`,
  },
  orderNotedByDriver: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Уведомление отмечено',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вы отметили уведомление о заказе ${orderName} от ${departureAddress} до ${arrivalAddress} как прочитанное. Время отправления: ${order.departureTime.toLocaleString()}.`,
  },
  orderNotedByClient: {
    title: (_order, _departureAddress, _arrivalAddress) => 'Уведомление отмечено',
    message: (order, orderName, departureAddress, arrivalAddress) =>
      `Вы отметили уведомление о заказе ${orderName} от ${departureAddress} до ${arrivalAddress} как прочитанное. Время отправления: ${order.departureTime.toLocaleString()}.`,
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
    console.log(`Отправлено ${notifications.length} уведомлений через WebSocket`);
  } catch (error) {
    log(`Ошибка при массовой отправке уведомлений:`, error);
    throw error;
  }
}
