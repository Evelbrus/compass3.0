// services/notifications/notificationCore.ts
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { Notification } from '@prisma/client';
import { NotificationWebSocketDTO } from '@next-app/src/dto/notifications/notifications.dto';
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Логгер для сервиса уведомлений
const log = debug('app:notification-core');
const logError = debug('app:notification-core:error');

/**
 * Подключение к WebSocket-серверу (если ещё не подключено)
 */
export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect();
    log('Установлено соединение с WebSocket-сервером');
  }
}

/**
 * Преобразует объект Notification для отправки через WebSocket
 * @param notification Объект уведомления
 * @returns Объект для отправки через WebSocket
 */
export function prepareNotificationForWebSocket(
  notification: Notification,
): NotificationWebSocketDTO {
  return {
    uuid: notification.uuid,
    userId: notification.userId,
    orderId: notification.orderId,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    clientById: notification.clientById,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
    driverById: notification.driverById,
  };
}

/**
 * Отправляет уведомление через WebSocket
 * @param notification Объект уведомления
 */
export function sendNotificationWebSocket(notification: Notification): void {
  connectSocket();
  const notificationData = prepareNotificationForWebSocket(notification);
  if (notification.userId) {
    socket.emit('notification', {
      userId: notification.userId,
      notification: notificationData,
    });
    log(`Уведомление отправлено через WebSocket для userId=${notification.userId}`);
  }
}

export async function createOrUpdateNotification({
  userId,
  orderId,
  title,
  message,
  notificationType, // новый параметр, например, 'driver' или 'admin'
  clientById,
  driverById,
  read = false,
}: {
  userId: string;
  orderId: string;
  title: string;
  message: string;
  notificationType: string;
  clientById?: string;
  driverById?: string;
  read?: boolean;
}): Promise<Notification> {
  try {
    console.log(`createOrUpdateNotification: входные данные:
      userId: ${userId},
      orderId: ${orderId},
      notificationType: ${notificationType},
      title: ${title},
      message: ${message},
      clientById: ${clientById},
      driverById: ${driverById},
      read: ${read}`);

    // Ищем уведомление по userId + orderId + notificationType
    const existingNotification = await prisma.notification.findFirst({
      where: { userId, orderId, notificationType },
    });

    let notification: Notification;
    if (existingNotification) {
      console.log(
        `Уведомление уже существует (uuid: ${existingNotification.uuid}). Будет обновлено.`,
      );
      notification = await prisma.notification.update({
        where: { uuid: existingNotification.uuid },
        data: {
          title,
          message,
          read,
          ...(clientById !== undefined && { clientById }),
          ...(driverById !== undefined && { driverById }),
          updatedAt: new Date(),
        },
      });
      console.log(`createOrUpdateNotification: уведомление обновлено:`, notification);
    } else {
      console.log(`Уведомление не найдено, будет создано новое.`);
      notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          orderId,
          notificationType, // сохраняем тип уведомления
          title,
          message,
          read,
          ...(clientById !== undefined && { clientById }),
          ...(driverById !== undefined && { driverById }),
        },
      });
      console.log(`createOrUpdateNotification: уведомление создано:`, notification);
    }
    return notification;
  } catch (error) {
    console.error('Ошибка при создании/обновлении уведомления:', error);
    throw error;
  }
}

/**
 * Создает множественные уведомления для списка пользователей
 * @param userIds Список ID пользователей
 * @param orderId ID заказа
 * @param title Заголовок уведомления
 * @param message Текст уведомления
 * @param clientById ID инициатора уведомления
 * @param driverById ID водителя (опционально)
 * @param read Статус прочтения (по умолчанию false)
 * @returns Созданные уведомления
 */
export async function createBulkNotifications({
  userIds,
  orderId,
  title,
  message,
  clientById, // Опционально, без значения по умолчанию
  driverById, // Опционально, без значения по умолчанию
  read = false,
}: {
  userIds: string[];
  orderId: string;
  title: string;
  message: string;
  clientById?: string; // Полностью опционально
  driverById?: string; // Полностью опционально
  read?: boolean;
}): Promise<Notification[]> {
  try {
    log(`Создание массовых уведомлений для ${userIds.length} пользователей, заказ: ${orderId}`);

    const notifications: Notification[] = [];

    // Для каждого пользователя проверяем существование и создаем/обновляем уведомление
    for (const userId of userIds) {
      const notificationParams: {
        userId: string;
        orderId: string;
        title: string;
        message: string;
        clientById?: string;
        driverById?: string;
        read: boolean;
      } = {
        userId,
        orderId,
        title,
        message,
        read,
      };

      // Добавляем clientById только если он передан
      if (clientById !== undefined) {
        notificationParams.clientById = clientById;
      }

      // Добавляем driverById только если он передан
      if (driverById !== undefined) {
        notificationParams.driverById = driverById;
      }

      const notification = await createOrUpdateNotification(notificationParams);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    logError('Ошибка при создании массовых уведомлений:', error);
    throw error;
  }
}

/**
 * Получает уведомления пользователя
 * @param userId ID пользователя
 * @returns Список уведомлений пользователя
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    log(`Получение уведомлений для пользователя: ${userId}`);

    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            status: true,
            driverAcceptanceStatus: true,
          },
        },
      },
    });
  } catch (error) {
    logError('Ошибка при получении уведомлений:', error);
    throw error;
  }
}

/**
 * Пометить уведомление как прочитанное или непрочитанное.
 * @param notificationUuid UUID уведомления
 * @param read true, если прочитано (по умолчанию true)
 * @returns Обновленное уведомление или null, если не найдено
 */
export async function markNotificationAsRead(notificationUuid: string, read = true) {
  try {
    log(`Маркируем уведомление ${notificationUuid} как прочитанное: ${read}`);

    // Ищем уведомление по uuid
    const notification = await prisma.notification.findUnique({
      where: { uuid: notificationUuid },
    });
    if (!notification) {
      log(`Уведомление с UUID ${notificationUuid} не найдено`);
      return null;
    }

    // Если статус уже совпадает, возвращаем как есть
    if (notification.read === read) {
      log(`Уведомление ${notificationUuid} уже имеет статус read=${read}`);
      return notification;
    }

    // Обновляем поле read
    const updatedNotification = await prisma.notification.update({
      where: { uuid: notificationUuid },
      data: { read },
    });

    // Отправляем обновление через WebSocket
    sendNotificationWebSocket(updatedNotification);

    log(
      `Обновление статуса уведомления ${notificationUuid} отправлено (read=${read}) пользователю ${updatedNotification.userId}`,
    );
    return updatedNotification;
  } catch (error) {
    logError(`Ошибка при обновлении статуса уведомления ${notificationUuid}:`, error);
    throw error;
  }
}
