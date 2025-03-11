import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus, UserRole } from '@prisma/client';
import { processBulkNotifications } from '@next-app/src/services/notifications/notifications';
import {
  getNotificationTemplateKey,
  shouldMarkAsRead,
} from '@next-app/src/services/notifications/notificationTemplates';

export interface NotificationRecipient {
  uuid: string;
  role: UserRole;
}

/**
 * Интерфейс для параметров отправки уведомлений о действиях водителя
 */
export interface SendDriverNotificationParams {
  orderId: string; // ID заказа
  driverId: string; // ID водителя
  actionType: // Тип действия
  | 'accept' // Принятие заказа
    | 'arrive' // Прибытие к точке отправления
    | 'start' // Начало поездки
    | 'pickup' // Подбор клиента
    | 'complete' // Завершение заказа
    | 'cancel' // Отмена заказа
    | 'timeout' // Истечение времени ожидания
    | 'notify';
  createdById: string; // ID пользователя, создавшего действие
  clientId: string; // ID клиента
  delay?: number; // Задержка отправки уведомления (опционально)
  previousDriverStatus?: DriverAcceptanceStatus | null; // Делаем nullable
}

/**
 * Результат отправки уведомления
 */
export interface NotificationResult {
  success: boolean;
  notificationIds?: string[];
  error?: string;
}

/**
 * Основная функция для отправки уведомлений о действиях водителя
 * @param params Параметры отправки уведомления
 * @returns Результат отправки уведомления
 */
export async function sendDriverNotifications(
  params: SendDriverNotificationParams,
): Promise<NotificationResult> {
  try {
    const { orderId, driverId, actionType, createdById, clientId, previousDriverStatus } = params;

    console.log('params', params);

    const order = await prisma.order.findUnique({
      where: { uuid: orderId },
      include: {
        assignedDriver: { select: { uuid: true, fullName: true } },
        clientBy: { select: { uuid: true, fullName: true } },
      },
    });

    if (!order) {
      return { success: false, error: 'Заказ не найден' };
    }

    const { orderStatus, driverStatus } = getStatusesFromAction(actionType);

    await prisma.order.update({
      where: { uuid: orderId },
      data: {
        status: orderStatus,
        driverAcceptanceStatus: driverStatus,
        ...(actionType === 'accept'
          ? { assignedDriverId: driverId }
          : actionType === 'cancel' || actionType === 'timeout'
            ? { assignedDriverId: null }
            : {}),
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: UserRole.Admin, availability: true },
      select: { uuid: true },
    });

    const recipients: NotificationRecipient[] = [];

    // Специальный случай: если заказ был просрочен (TIMEOUT), уведомляем водителя и админа
    if (previousDriverStatus === DriverAcceptanceStatus.TIMEOUT) {
      recipients.push({ uuid: driverId, role: UserRole.Driver });
      admins.forEach((admin) => {
        recipients.push({ uuid: admin.uuid, role: UserRole.Admin });
      });
      // Клиент добавляется только для обычного принятия, а не для просроченного
      if (actionType === 'accept') {
        recipients.push({ uuid: clientId, role: UserRole.Client });
      }
    } else {
      // Обычная логика для других случаев
      if (actionType !== 'timeout') {
        recipients.push({ uuid: driverId, role: UserRole.Driver });
      }
      recipients.push({ uuid: clientId, role: UserRole.Client });

      if (orderStatus === OrderStatus.CANCELLED || orderStatus === OrderStatus.OVERDUE) {
        admins.forEach((admin) => {
          recipients.push({ uuid: admin.uuid, role: UserRole.Admin });
        });
      } else if (createdById && createdById !== clientId && createdById !== driverId) {
        recipients.push({ uuid: createdById, role: UserRole.Admin });
      }
    }

    const notificationPromises = ['driver', 'client', 'admin'].map(async (role) => {
      const roleRecipients = recipients.filter((r) => {
        if (role === 'driver') return r.role === UserRole.Driver;
        if (role === 'client') return r.role === UserRole.Client || r.role === UserRole.ClientCorp;
        if (role === 'admin') return r.role === UserRole.Admin;
        return false;
      });

      if (roleRecipients.length === 0) return null;

      const templateKey = getNotificationTemplateKey(
        orderStatus,
        driverStatus,
        role as 'driver' | 'client' | 'admin',
        previousDriverStatus,
      );

      const markAsRead = shouldMarkAsRead(templateKey, role as 'driver' | 'client' | 'admin');

      try {
        await processBulkNotifications({
          recipients: roleRecipients,
          orderId,
          templateKey,
          driverId,
          clientId,
          markNotificationAsRead: markAsRead,
        });

        return { success: true, uuid: orderId };
      } catch (error) {
        console.error(`Ошибка при отправке уведомлений для роли ${role}:`, error);
        return null;
      }
    });

    const results = await Promise.all(notificationPromises);
    const successfulResults = results.filter(Boolean);

    console.log('results', results);

    return {
      success: successfulResults.length > 0,
      notificationIds: successfulResults.map((r) => r?.uuid).filter(Boolean) as string[],
    };
  } catch (error) {
    console.error('Ошибка при отправке уведомлений:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при отправке уведомлений',
    };
  }
}

function getStatusesFromAction(actionType: SendDriverNotificationParams['actionType']): {
  orderStatus: OrderStatus;
  driverStatus: DriverAcceptanceStatus;
} {
  switch (actionType) {
    case 'accept':
      return {
        orderStatus: OrderStatus.IN_PROGRESS,
        driverStatus: DriverAcceptanceStatus.ACCEPTED,
      };
    case 'arrive':
      return {
        orderStatus: OrderStatus.IN_PROGRESS,
        driverStatus: DriverAcceptanceStatus.ARRIVED,
      };
    case 'start':
      return {
        orderStatus: OrderStatus.IN_PROGRESS,
        driverStatus: DriverAcceptanceStatus.ON_THE_WAY,
      };
    case 'pickup':
      return {
        orderStatus: OrderStatus.IN_PROGRESS,
        driverStatus: DriverAcceptanceStatus.PICKED_UP,
      };
    case 'complete':
      return {
        orderStatus: OrderStatus.COMPLETED,
        driverStatus: DriverAcceptanceStatus.COMPLETED,
      };
    case 'cancel':
      return {
        orderStatus: OrderStatus.CANCELLED,
        driverStatus: DriverAcceptanceStatus.CANCELLED,
      };
    case 'timeout':
      return {
        orderStatus: OrderStatus.IN_PROGRESS,
        driverStatus: DriverAcceptanceStatus.ACCEPTED,
      };
    case 'notify':
      return {
        orderStatus: OrderStatus.PENDING,
        driverStatus: DriverAcceptanceStatus.NOTIFIED,
      };
    default:
      return {
        orderStatus: OrderStatus.PENDING,
        driverStatus: DriverAcceptanceStatus.PENDING,
      };
  }
}

/**
 * Отправляет уведомление о принятии заказа водителем
 */
export async function sendDriverAcceptedNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
  previousDriverStatus?: DriverAcceptanceStatus | null,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'accept',
    createdById,
    clientId,
    previousDriverStatus,
  });
}

/**
 * Отправляет уведомление о прибытии водителя к точке отправления
 */
export async function sendDriverArrivedNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'arrive',
    createdById,
    clientId,
  });
}

/**
 * Отправляет уведомление о начале поездки
 */
export async function sendDriverStartedNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'start',
    createdById,
    clientId,
  });
}

/**
 * Отправляет уведомление о подборе клиента
 */
export async function sendDriverPickedUpNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'pickup',
    createdById,
    clientId,
  });
}

/**
 * Отправляет уведомление о завершении заказа
 */
export async function sendDriverCompletedNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'complete',
    createdById,
    clientId,
  });
}

/**
 * Отправляет уведомление об отмене заказа
 */
export async function sendDriverCancelledNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'cancel',
    createdById,
    clientId,
    delay: 0,
  });
}

/**
 * Отправляет уведомление о истечении времени ожидания
 */
export async function sendDriverTimeoutNotification(
  orderId: string,
  driverId: string,
  createdById: string,
  clientId: string,
): Promise<NotificationResult> {
  return sendDriverNotifications({
    orderId,
    driverId,
    actionType: 'timeout',
    createdById,
    clientId,
  });
}
