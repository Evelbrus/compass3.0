import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@shared/prisma/prisma-client';
import { Order, Notification } from '@prisma/client';
import { notificationTemplates } from '@next-app/src/services/notifications/notificationTemplates';
import { socket } from '@next-app/src/lib/websocket/websocket-client';

export interface ProcessNotificationParams {
  createdById?: string;
  orderId?: string;
  templateKey: keyof typeof notificationTemplates;
  driverId?: string | undefined;
  clientId?: string | undefined;
  markNotificationAsRead?: boolean;
}

export interface ProcessBulkNotificationsParams {
  recipients: { uuid: string; role: string }[];
  orderId?: string;
  templateKey: keyof typeof notificationTemplates;
  driverId?: string | undefined;
  clientId?: string | undefined;
  markNotificationAsRead?: boolean;
}


let listenersInitialized = false;

export function ensureSocketConnection(): boolean {
  if (!socket.connected) {
    socket.connect();

    if (!listenersInitialized) {
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            socket.connect();
          }, 5000);
        }
      });

      listenersInitialized = true;
    }
  }
  return socket.connected;
}

function getOrderName(order: Pick<Order, 'uuid'>): string {
  return `№${order.uuid}`;
}

async function getOrderData(orderId: string) {
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
    throw new Error('Order not found');
  }

  return {
    order,
    departureAddress: order.departurePoint.address,
    arrivalAddress: order.arrivalPoint.address,
    clientFullName: order.clientBy.fullName,
    driverFullName: order.assignedDriver?.fullName || null,
    orderName: getOrderName(order),
  };
}

function createNotificationData(
  templateKey: keyof typeof notificationTemplates,
  order: any,
  orderName: string,
  departureAddress: string,
  arrivalAddress: string,
  clientFullName: string,
  driverFullName: string | null,
) {
  const template = notificationTemplates[templateKey];
  if (!template) {
    throw new Error('Notification template not found');
  }

  const orderForTemplate = {
    ...order,
    createdBy: { fullName: clientFullName },
  };

  return {
    title: template.title(orderForTemplate),
    message: template.message(
      orderForTemplate,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName || '',
    ),
  };
}

export async function processNotification({
  createdById,
  orderId,
  templateKey,
  clientId,
  driverId,
  markNotificationAsRead = false,
}: ProcessNotificationParams): Promise<Notification> {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const { order, departureAddress, arrivalAddress, clientFullName, driverFullName, orderName } =
      await getOrderData(orderId);

    const { title, message } = createNotificationData(
      templateKey,
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );

    const readValue = markNotificationAsRead;

    const existingNotification = await prisma.notification.findFirst({
      where: {
        orderId,
        createdById,
        ...(driverId ? { driverId } : {}),
        ...(clientId ? { clientId } : {}),
      },
    });

    let notification: Notification;

    if (existingNotification) {
      notification = await prisma.notification.update({
        where: { uuid: existingNotification.uuid },
        data: {
          title,
          message,
          read: readValue,
          clientId: clientId || null,
          driverId: driverId || null,
          updatedAt: new Date(),
        },
      });
    } else {
      notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          createdById: createdById || null,
          orderId,
          title,
          message,
          read: readValue,
          clientId: clientId || null,
          driverId: driverId || null,
        },
      });
    }

    const notificationData: Notification = {
      uuid: notification.uuid,
      createdById: notification?.createdById || null,
      orderId: notification?.orderId || null,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      clientId: notification.clientId,
      driverId: notification.driverId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };

    

    if (ensureSocketConnection()) {
      if (createdById) {
        console.log(`Отправка уведомления пользователю ${createdById}:`, notificationData);
        socket.emit('notification', {
          userId: createdById,
          notification: notificationData,
        });
      }
    } else {
      console.warn(`Socket not connected, unable to send notification ${notification.uuid}`);
    }

    return notification;
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
}

export async function processBulkNotifications({
  recipients,
  orderId,
  templateKey,
  driverId,
  clientId,
  markNotificationAsRead = false,
}: ProcessBulkNotificationsParams): Promise<Notification[]> {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const { order, departureAddress, arrivalAddress, clientFullName, driverFullName, orderName } =
      await getOrderData(orderId);

    const { title, message } = createNotificationData(
      templateKey,
      order,
      orderName,
      departureAddress,
      arrivalAddress,
      clientFullName,
      driverFullName,
    );

    const existingNotifications = await prisma.notification.findMany({
      where: { orderId },
      select: { uuid: true, clientId: true, driverId: true, createdById: true },
    });

    const existingNotificationsMap = new Map();
    existingNotifications.forEach((notification) => {
      if (notification.createdById) {
        existingNotificationsMap.set(`user-${notification.createdById}`, notification);
      }
    });

    const readValue = markNotificationAsRead;

    const notificationPromises = recipients.map((recipient) => {
      const key = `user-${recipient.uuid}`;
      const existingNotification = existingNotificationsMap.get(key);

      if (existingNotification) {
        return prisma.notification.update({
          where: { uuid: existingNotification.uuid },
          data: {
            title,
            message,
            read: readValue,
            clientId: clientId || null,
            driverId: driverId || null,
            updatedAt: new Date(),
          },
        });
      } else {
        return prisma.notification.create({
          data: {
            uuid: uuidv4(),
            createdById: recipient.uuid,
            clientId: clientId || null,
            driverId: driverId || null,
            orderId,
            title,
            message,
            read: readValue,
          },
        });
      }
    });

    const notifications = await Promise.all(notificationPromises);

    if (ensureSocketConnection()) {
      notifications.forEach((notification) => {
        const notificationData = {
          uuid: notification.uuid,
          createdById: notification?.createdById || null,
          orderId: notification?.orderId || null,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          clientId: notification.clientId,
          driverId: notification.driverId,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        };

        const recipientId = notification.createdById;

        if (recipientId) {
          console.log(`Отправка уведомления получателю ${recipientId}:`, notificationData);
          socket.emit('notification', {
            userId: recipientId,
            notification: notificationData,
          });
        }
      });
    } else {
      console.warn('Socket not connected, notifications queued for later delivery');
    }

    return notifications;
  } catch (error) {
    console.error('Error processing bulk notifications:', error);
    throw error;
  }
}

export function closeSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
