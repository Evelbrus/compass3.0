// services/notifications/roleNotifications/clientNotifications.ts

import debug from 'debug';
import { Notification, Order } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { notificationTemplates } from '@next-app/src/services/notifications/notificationTemplates';
import {
  createOrUpdateNotification,
  sendNotificationWebSocket,
} from '@next-app/src/services/notifications/notificationCore';

// Логгеры
const log = debug('app:notifications:client');
const logError = debug('app:notifications:client:error');

/**
 * Отправляет уведомление клиенту о создании заказа
 * @param clientId ID клиента (получателя уведомления)
 * @param orderId ID заказа
 * @returns Созданное уведомление
 */
export async function notifyClientOrderCreated(
  clientId: string,
  orderId: string,
): Promise<Notification> {
  try {
    log(`Уведомление клиента ${clientId} о создании заказа ${orderId}`);

    const order = await getOrderWithDetails(orderId);
    if (!order) {
      log(`Заказ с ID ${orderId} не найден`);
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const template = notificationTemplates.orderCreatedToClient;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    const notification = await createOrUpdateNotification({
      userId: clientId,
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: order.assignedDriverId || undefined,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления о создании заказа клиенту ${clientId}:`, error);
    throw error;
  }
}

/**
 * Уведомляет клиента об обновлении заказа администратором
 * @param clientId ID клиента
 * @param orderId ID заказа
 * @param adminId ID администратора, обновившего заказ
 * @param driverId ID водителя (опционально)
 */
export async function notifyClientOrderUpdatedByAdmin(
  clientId: string,
  orderId: string,
  adminId: string,
  driverId?: string,
): Promise<Notification> {
  try {
    log(
      `Уведомление клиента ${clientId} об обновлении заказа ${orderId} администратором ${adminId}`,
    );

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderUpdatedByAdminToClient;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    const notification = await createOrUpdateNotification({
      userId: clientId,
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: driverId || undefined,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления об обновлении заказа клиенту ${clientId}:`, error);
    throw error;
  }
}

/**
 * Уведомляет клиента об отмене заказа администратором
 */
export async function notifyClientOrderDeletedByAdmin(
  clientId: string,
  orderId: string,
  adminId: string,
  driverId?: string,
): Promise<Notification> {
  try {
    log(`Уведомление клиента ${clientId} об отмене заказа ${orderId} администратором ${adminId}`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderDeletedByAdminToClient;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    const notification = await createOrUpdateNotification({
      userId: clientId,
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: driverId || undefined,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления об отмене заказа клиенту ${clientId}:`, error);
    throw error;
  }
}

export async function notifyClientOrderStatusChanged(
  clientId: string,
  orderId: string,
  driverId?: string,
  isCompleted: boolean = false, // Новый опциональный параметр
): Promise<Notification> {
  try {
    log(`Уведомление клиента ${clientId} об изменении статуса заказа ${orderId}`);
    const order = await getOrderWithDetails(orderId);
    // Выбираем шаблон в зависимости от isCompleted
    const template = isCompleted
      ? notificationTemplates.orderCompletedToClient
      : notificationTemplates.orderStatusChangedToClient;
    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );
    const notification = await createOrUpdateNotification({
      userId: clientId, // Уведомление для клиента
      orderId,
      title,
      message,
      driverById: driverId, // Контекст: ID водителя
    });
    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(
      `Ошибка при отправке уведомления об изменении статуса заказа клиенту ${clientId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Уведомляет клиента о ходе выполнения заказа
 */
/**
 * Уведомляет клиента о ходе выполнения заказа
 * @param clientId ID клиента
 * @param orderId ID заказа
 * @param driverId ID водителя (опционально)
 */
export async function notifyClientOrderInProgress(
  clientId: string,
  orderId: string,
  driverId: string,
): Promise<Notification> {
  try {
    log(
      `Уведомление клиента ${clientId} о ходе выполнения заказа ${orderId} водителем ${driverId}`,
    );
    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderInProgressClient;
    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );
    const notification = await createOrUpdateNotification({
      userId: clientId, // Уведомление для клиента
      orderId,
      title,
      message,
      clientById: clientId, // Контекст: ID клиента
      driverById: driverId, // Контекст: ID водителя
    });
    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления о ходе заказа клиенту ${clientId}:`, error);
    throw error;
  }
}

/**
 * Уведомляет клиента об отмене заказа водителем
 */
export async function notifyClientOrderCancelledByDriver(
  clientId: string,
  orderId: string,
  driverId: string,
): Promise<Notification> {
  try {
    log(`Уведомление клиента ${clientId} об отмене заказа ${orderId} водителем ${driverId}`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderCancelledByDriverToClient;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    const notification = await createOrUpdateNotification({
      userId: clientId,
      orderId,
      title,
      message,
      clientById: driverId,
      driverById: driverId,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(
      `Ошибка при отправке уведомления об отмене заказа водителем клиенту ${clientId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Вспомогательная функция для получения заказа с деталями
 */
async function getOrderWithDetails(orderId: string): Promise<
  Order & {
    departurePoint: { address: string };
    arrivalPoint: { address: string };
    clientBy: { fullName: string };
    assignedDriver?: { fullName: string } | null;
  }
> {
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
    throw new Error(`Заказ с ID ${orderId} не найден`);
  }

  return order;
}
