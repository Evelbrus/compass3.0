// services/notifications/roleNotifications/adminNotifications.ts

import debug from 'debug';
import { Notification, Order, UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { notificationTemplates } from '@next-app/src/services/notifications/notificationTemplates';
import {
  createBulkNotifications,
  createOrUpdateNotification,
  sendNotificationWebSocket,
} from '@next-app/src/services/notifications/notificationCore';

// Логгеры
const log = debug('app:notifications:admin');
const logError = debug('app:notifications:admin:error');

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
 * Получает список всех администраторов и операторов
 */
async function getAdminsAndOperators() {
  return await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.Admin, UserRole.Operator],
      },
    },
    select: {
      uuid: true,
      role: true,
    },
  });
}

/**
 * Уведомляет администратора о выполненном им действии с заказом
 */
export async function notifyAdminOrderUpdated(
  adminId: string,
  orderId: string,
  isCompleted: boolean = false, // Новый опциональный параметр
): Promise<Notification> {
  try {
    log(`Уведомление администратора ${adminId} об обновлении заказа ${orderId}`);
    const order = await getOrderWithDetails(orderId);
    const template = isCompleted
      ? notificationTemplates.orderSuccesByAdminToAdmin
      : notificationTemplates.orderUpdatedByAdminToAdmin;
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
      userId: adminId,
      orderId,
      title,
      message,
      clientById: order.clientById,
      driverById: order.assignedDriverId || undefined,
    });
    sendNotificationWebSocket(notification);
    return notification;
  } catch (error) {
    logError(`Ошибка при отправке уведомления об обновлении заказа админу ${adminId}:`, error);
    throw error;
  }
}

/**
 * Массово уведомляет всех администраторов и операторов о просроченном заказе, принятом водителем
 */
export async function notifyAdminsOverdueOrderAccepted(
  orderId: string,
  driverId: string,
): Promise<Notification[]> {
  try {
    log(
      `Массовое уведомление админов о принятии просроченного заказа ${orderId} водителем ${driverId}`,
    );

    const adminsAndOperators = await getAdminsAndOperators();
    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderOverdueAcceptedByDriverToAdmins;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    // Создаем массово уведомления
    const notifications = await createBulkNotifications({
      userIds: adminsAndOperators.map((admin) => admin.uuid),
      orderId,
      title,
      message,
      driverById: driverId,
    });

    // Отправляем каждое через WebSocket
    notifications.forEach((notification) => {
      sendNotificationWebSocket(notification);
    });

    return notifications;
  } catch (error) {
    logError(`Ошибка при массовой отправке уведомлений о просроченном заказе ${orderId}:`, error);
    throw error;
  }
}

/**
 * Массово уведомляет всех администраторов и операторов об отмене заказа водителем
 */
export async function notifyAdminsOrderCancelledByDriver(
  orderId: string,
  driverId: string,
  initiatorId: string,
): Promise<Notification[]> {
  try {
    log(`Массовое уведомление админов об отмене заказа ${orderId} водителем ${driverId}`);

    const adminsAndOperators = await getAdminsAndOperators();
    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderCancelledByDriverToAdmins;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    // Создаем массово уведомления
    const notifications = await createBulkNotifications({
      userIds: adminsAndOperators.map((admin) => admin.uuid),
      orderId,
      title,
      message,
      clientById: initiatorId,
      driverById: driverId,
    });

    // Отправляем каждое через WebSocket
    notifications.forEach((notification) => {
      sendNotificationWebSocket(notification);
    });

    return notifications;
  } catch (error) {
    logError(
      `Ошибка при массовой отправке уведомлений об отмене заказа ${orderId} водителем:`,
      error,
    );
    throw error;
  }
}

/**
 * Массово уведомляет всех администраторов и операторов об обновлении заказа клиентом
 */
export async function notifyAdminsOrderUpdatedByClient(
  orderId: string,
  clientId: string,
): Promise<Notification[]> {
  try {
    log(`Массовое уведомление админов об обновлении заказа ${orderId} клиентом ${clientId}`);

    const adminsAndOperators = await getAdminsAndOperators();
    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderUpdatedByCorpClientToAdmins;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    // Создаем массово уведомления
    const notifications = await createBulkNotifications({
      userIds: adminsAndOperators.map((admin) => admin.uuid),
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: order.assignedDriverId || undefined,
    });

    // Отправляем каждое через WebSocket
    notifications.forEach((notification) => {
      sendNotificationWebSocket(notification);
    });

    return notifications;
  } catch (error) {
    logError(
      `Ошибка при массовой отправке уведомлений об обновлении заказа ${orderId} клиентом:`,
      error,
    );
    throw error;
  }
}

/**
 * Массово уведомляет всех администраторов и операторов об отмене заказа клиентом
 */
export async function notifyAdminsOrderCancelledByClient(
  orderId: string,
  clientId: string,
): Promise<Notification[]> {
  try {
    log(`Массовое уведомление админов об отмене заказа ${orderId} клиентом ${clientId}`);

    const adminsAndOperators = await getAdminsAndOperators();
    const order = await getOrderWithDetails(orderId);
    const template = notificationTemplates.orderCancelledByCorpClientToAdmins;

    const title = template.title(order, order.departurePoint.address, order.arrivalPoint.address);
    const message = template.message(
      order,
      `№${order.uuid}`,
      order.departurePoint.address,
      order.arrivalPoint.address,
      order.clientBy.fullName,
      order.assignedDriver?.fullName || null,
    );

    // Создаем массово уведомления
    const notifications = await createBulkNotifications({
      userIds: adminsAndOperators.map((admin) => admin.uuid),
      orderId,
      title,
      message,
      clientById: clientId,
      driverById: order.assignedDriverId || undefined,
    });

    // Отправляем каждое через WebSocket
    notifications.forEach((notification) => {
      sendNotificationWebSocket(notification);
    });

    return notifications;
  } catch (error) {
    logError(
      `Ошибка при массовой отправке уведомлений об отмене заказа ${orderId} клиентом:`,
      error,
    );
    throw error;
  }
}
