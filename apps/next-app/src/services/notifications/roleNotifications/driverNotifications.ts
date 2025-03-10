// services/notifications/roleNotifications/driverNotifications.ts

import debug from 'debug';
import { Notification, Order } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { notificationTemplates } from '@next-app/src/services/notifications/notificationTemplates';
import {
  createOrUpdateNotification,
  sendNotificationWebSocket,
} from '@next-app/src/services/notifications/notificationCore';

// Логгеры
const log = debug('app:notifications:driver');
const logError = debug('app:notifications:driver:error');

/**
 * Получение заказа с дополнительными данными (вспомогательная функция)
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

/**
 * Уведомляет водителя о том, что заказ взят на рассмотрение
 */
export async function notifyDriverOrderNoted(
  driverId: string,
  orderId: string,
  clientById: string,
): Promise<Notification> {
  try {
    log(`Уведомление водителя ${driverId} о взятии заказа ${orderId} на рассмотрение`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderNotedByDriver;

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: clientById,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(
      `Ошибка при отправке уведомления о взятии заказа на рассмотрение водителем ${driverId}:`,
      error,
    );
    throw error;
  }
}

export async function notifyDriverOrderInProgress(
  driverId: string,
  orderId: string,
  clientId: string,
  isCompleted: boolean = false,
): Promise<Notification> {
  try {
    console.log(
      `notifyDriverOrderInProgress вызвана для driverId=${driverId} с isCompleted=${isCompleted}`,
    );
    const order = await getOrderWithDetails(orderId);
    const template = isCompleted
      ? notificationTemplates.orderCompletedByDriver
      : notificationTemplates.orderInProgressDriver;
    console.log(
      `Используем шаблон: ${isCompleted ? 'orderCompletedByDriver' : 'orderInProgressDriver'}`,
    );

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: clientId,
    });
    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления водителю ${driverId}:`, error);
    throw error;
  }
}

/**
 * Уведомляет водителя об отмене заказа самим водителем
 */
export async function notifyDriverOrderCancelled(
  driverId: string,
  orderId: string,
  initiatorId: string,
): Promise<Notification> {
  try {
    log(`Уведомление водителя ${driverId} об отмене заказа ${orderId}`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderCancelledByDriverToDriver;

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: initiatorId,
      driverById: driverId,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления об отмене заказа водителем ${driverId}:`, error);
    throw error;
  }
}

/**
 * Уведомляет водителя о назначении на заказ (после переназначения)
 */
export async function notifyDriverReassigned(
  driverId: string,
  orderId: string,
  initiatorId: string,
): Promise<Notification> {
  try {
    log(`Уведомление водителя ${driverId} о назначении на заказ ${orderId}`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderUpdatedDriverReassigned;

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: initiatorId,
      driverById: driverId,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления о назначении водителя ${driverId} на заказ:`, error);
    throw error;
  }
}

/**
 * Уведомляет водителя об удалении заказа администратором
 */
export async function notifyDriverOrderDeletedByAdmin(
  driverId: string,
  orderId: string,
  adminId: string,
): Promise<Notification> {
  try {
    log(
      `Уведомление водителя ${driverId} об удалении заказа ${orderId} администратором ${adminId}`,
    );

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderDeletedByAdminToDriver;

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: order.clientById,
      driverById: driverId,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(
      `Ошибка при отправке уведомления об удалении заказа администратором водителю ${driverId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Уведомляет водителя об отмене заказа клиентом
 */
export async function notifyDriverOrderCancelledByClient(
  driverId: string,
  orderId: string,
  clientId: string,
): Promise<Notification> {
  try {
    log(`Уведомление водителя ${driverId} об отмене заказа ${orderId} клиентом ${clientId}`);

    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderCancelledByCorpClientToDriver;

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
      userId: driverId,
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: driverId,
    });

    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(
      `Ошибка при отправке уведомления об отмене заказа клиентом водителю ${driverId}:`,
      error,
    );
    throw error;
  }
}
