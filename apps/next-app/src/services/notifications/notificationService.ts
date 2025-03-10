// services/notifications/notificationService.ts
import debug from 'debug';
import { Notification } from '@prisma/client';
import { orderQueue } from '@next-app/src/lib/queues/orderQueue';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';

// Базовые функции
import {
  getUserNotifications,
  markNotificationAsRead,
  sendNotificationWebSocket,
} from '@next-app/src/services/notifications/notificationCore';

// Импорт уведомлений по ролям
import * as clientNotifications from '@next-app/src/services/notifications/roleNotifications/clientNotifications';
import * as driverNotifications from '@next-app/src/services/notifications/roleNotifications/driverNotifications';
import * as adminNotifications from '@next-app/src/services/notifications/roleNotifications/adminNotifications';
import { notificationTemplates } from '@next-app/src/services/notifications/notificationTemplates';

// Логгер для сервиса уведомлений
const log = debug('app:notification-service');
const logError = debug('app:notification-service:error');

// Экспортируем базовые функции
export { getUserNotifications, markNotificationAsRead };

// Экспортируем специфичные функции по ролям
export const client = clientNotifications;
export const driver = driverNotifications;
export const admin = adminNotifications;

/**
 * Универсальная функция для создания или обновления одиночного уведомления по шаблону.
 * Это интерфейс высокого уровня для всей системы уведомлений.
 *
 * @param userId Кому отправляем уведомление (получатель)
 * @param orderId Какому заказу оно относится
 * @param templateKey Ключ шаблона, определяющий текст заголовка (title) и содержание (message)
 * @param clientById Кто инициировал создание уведомления
 * @param driverById UUID водителя (если есть)
 * @param delay Задержка в миллисекундах перед отправкой (через очередь)
 * @param markAsRead Если true, создадим уведомление сразу прочитанным
 * @returns Возвращает созданное или обновленное уведомление
 */
export async function processNotification({
  userId,
  orderId,
  templateKey,
  clientById,
  driverById = null,
  delay = 0,
  markAsRead = false,
}: {
  userId: string;
  orderId: string;
  templateKey: keyof typeof notificationTemplates;
  clientById: string;
  driverById?: string | null;
  delay?: number;
  markAsRead?: boolean;
}): Promise<Notification> {
  try {
    log(
      `processNotification → userId=${userId}, orderId=${orderId}, templateKey=${templateKey}, delay=${delay}`,
    );

    // Ищем заказ, чтобы сформировать текст уведомления
    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        clientBy: { select: { fullName: true } },
        assignedDriver: { select: { fullName: true } },
      },
    });
    if (!order) {
      log('Заказ не найден в базе');
      throw new Error('Order not found');
    }

    // Выбираем шаблон по ключу
    const template = notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Шаблон уведомления "${templateKey}" не найден`);
    }

    // Генерируем заголовок и сообщение
    const orderName = `№${order.uuid}`;
    const departureAddress = order.departurePoint.address;
    const arrivalAddress = order.arrivalPoint.address;
    const clientFullName = order.clientBy.fullName;
    const driverFullName = order.assignedDriver?.fullName || null;

    const title = template.title(order, departureAddress, arrivalAddress);
    const message = template.message(
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );

    // Проверяем, существует ли уже уведомление для userId + orderId
    const existingNotification = await prisma.notification.findFirst({
      where: { userId, orderId },
    });

    let notification: Notification;
    if (existingNotification) {
      // Обновляем существующее
      notification = await prisma.notification.update({
        where: { uuid: existingNotification.uuid },
        data: {
          title,
          message,
          read: markAsRead,
          clientById,
          driverById,
          updatedAt: new Date(),
        },
      });
      log(`Уведомление обновлено: ${notification.uuid}`);
    } else {
      // Создаем новое
      notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          orderId,
          title,
          message,
          read: markAsRead,
          clientById,
          driverById,
        },
      });
      log(`Уведомление создано: ${notification.uuid}`);
    }

    // Если есть задержка – отправляем в очередь
    if (delay > 0) {
      await orderQueue.add(
        'notification',
        {
          userId,
          orderId,
          templateKey,
          clientById,
          driverById,
          markAsRead,
        },
        {
          delay: Math.max(delay, 0),
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId: `notification-${notification.uuid}`,
        },
      );
      log(`Уведомление добавлено в очередь (delay=${delay}мс)`);
    } else {
      // Отправляем через WebSocket прямо сейчас
      sendNotificationWebSocket(notification);
    }

    return notification;
  } catch (error) {
    logError(
      `Ошибка в processNotification (userId=${userId}, orderId=${orderId}, templateKey=${templateKey}):`,
      error,
    );
    throw error;
  }
}

/**
 * Массовая отправка уведомлений через шаблоны
 * @param users Список пользователей для уведомления
 * @param orderId ID заказа
 * @param templateKey Ключ шаблона уведомления
 * @param clientId ID клиента (опционально)
 * @param driverId ID водителя (опционально)
 */
/**
 * Массовая отправка уведомлений через шаблоны.
 * Вызывается, когда нужно отправить однотипное уведомление многим пользователям.
 */
export async function processBulkNotifications({
  users,
  orderId,
  templateKey,
  clientId, // Изменено с clientById на clientId
  driverById = null,
}: {
  users: { uuid: string; role: string }[];
  orderId: string;
  templateKey: keyof typeof notificationTemplates;
  clientId: string; // Изменено здесь
  driverById?: string | null;
}): Promise<void> {
  try {
    log(
      `processBulkNotifications → orderId=${orderId}, templateKey=${templateKey}, usersCount=${users.length}`,
    );

    // Находим заказ для формирования уведомления
    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: {
        departurePoint: true,
        arrivalPoint: true,
        clientBy: { select: { fullName: true } },
        assignedDriver: { select: { fullName: true } },
      },
    });
    if (!order) {
      log(`Заказ с UUID ${orderId} не найден`);
      throw new Error('Order not found');
    }

    // Получаем шаблон
    const template = notificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Шаблон уведомления "${templateKey}" не найден`);
    }

    // Формируем общие данные для уведомлений
    const orderName = `№${order.uuid}`;
    const departureAddress = order.departurePoint.address;
    const arrivalAddress = order.arrivalPoint.address;
    const clientFullName = order.clientBy.fullName;
    const driverFullName = order.assignedDriver?.fullName || null;

    const title = template.title(order, departureAddress, arrivalAddress);
    const message = template.message(
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );

    // Создаем или обновляем уведомления для всех пользователей
    const notifications = await Promise.all(
      users.map(async (user) => {
        const notificationData = {
          userId: user.uuid,
          orderId,
          title,
          message,
          read: false, // По умолчанию массовые уведомления непрочитанные
          clientById: clientId, // Используем clientId как clientById
          driverById,
        };

        const existingNotification = await prisma.notification.findFirst({
          where: { userId: user.uuid, orderId },
        });

        if (existingNotification) {
          return prisma.notification.update({
            where: { uuid: existingNotification.uuid },
            data: {
              ...notificationData,
              updatedAt: new Date(),
            },
          });
        } else {
          return prisma.notification.create({
            data: {
              uuid: uuidv4(),
              ...notificationData,
            },
          });
        }
      }),
    );

    // Отправляем все уведомления через WebSocket
    notifications.forEach((notification) => {
      sendNotificationWebSocket(notification);
    });

    log(
      `Массовые уведомления отправлены для ${users.length} пользователей по шаблону "${templateKey}".`,
    );
  } catch (error) {
    logError(`Ошибка при массовой отправке уведомлений (templateKey=${templateKey}):`, error);
    throw error;
  }
}
