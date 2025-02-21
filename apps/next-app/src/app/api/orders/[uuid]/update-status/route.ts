import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import {
  DriverAcceptanceStatus,
  OrderStatus,
  Action,
  DriverStatus,
  UserRole,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '@socket-server';

const log = debug('app:orders:update-status');

interface Params {
  uuid: string;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Updating status for order UUID: ${uuid}`);

  try {
    const {
      driverStatus,
      orderStatus,
      driverId,
      notificationUuid,
      markNotificationAsRead,
      action,
    } = await req.json();

    log(`Received data:`, { driverStatus, orderStatus, driverId, notificationUuid, action });

    if (driverStatus && !Object.values(DriverAcceptanceStatus).includes(driverStatus)) {
      log(`Invalid driverStatus: ${driverStatus}`);
      return NextResponse.json({ error: 'Invalid driver acceptance status' }, { status: 400 });
    }
    if (orderStatus && !Object.values(OrderStatus).includes(orderStatus)) {
      log(`Invalid orderStatus: ${orderStatus}`);
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }
    if (action && !Object.values(Action).includes(action)) {
      log(`Invalid action: ${action}`);
      return NextResponse.json({ error: 'Invalid action value' }, { status: 400 });
    }

    const updatedData = await prisma.$transaction(async (prismaTx) => {
      const order = await prismaTx.order.findUnique({
        where: { uuid },
      });
      if (!order) {
        log(`Order with UUID ${uuid} not found`);
        throw new Error('Order not found');
      }

      let driver = null;
      if (driverId) {
        driver = await prismaTx.user.findUnique({
          where: { uuid: driverId },
        });
        if (!driver) {
          log(`Driver with UUID ${driverId} not found`);
          throw new Error('Driver not found');
        }
      }

      const updatedOrder = await prismaTx.order.update({
        where: { uuid },
        data: {
          ...(orderStatus && { status: orderStatus }),
          ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
          ...(driverId !== undefined && { assignedDriverId: driverId }),
        },
      });

      let updatedDriver = null;
      if (driverId) {
        if (
          driverStatus === DriverAcceptanceStatus.COMPLETED ||
          driverStatus === DriverAcceptanceStatus.TIMEOUT ||
          orderStatus === OrderStatus.COMPLETED ||
          orderStatus === OrderStatus.CANCELLED ||
          orderStatus === OrderStatus.OVERDUE
        ) {
          updatedDriver = await prismaTx.user.update({
            where: { uuid: driverId },
            data: { driverStatus: DriverStatus.FREE },
          });
        } else if (
          driverStatus === DriverAcceptanceStatus.TAKEN ||
          driverStatus === DriverAcceptanceStatus.ACCEPTED
        ) {
          updatedDriver = await prismaTx.user.update({
            where: { uuid: driverId },
            data: { driverStatus: DriverStatus.BUSY },
          });
        }
      }

      let updatedNotification = null;
      if (notificationUuid && markNotificationAsRead) {
        updatedNotification = await prismaTx.notification.update({
          where: { uuid: notificationUuid },
          data: {
            read: true,
            ...(action && { action }),
          },
        });
        log(`Updated driver notification:`, updatedNotification);

        //Отправка обновлённого уведомления водителю через WebSocket
        if (driverId) {
          const notificationData = {
            uuid: updatedNotification.uuid,
            userId: updatedNotification.userId,
            title: updatedNotification.title || 'Статус заказа обновлён',
            message: updatedNotification.message || `Статус заказа #${uuid} обновлён`,
            orderId: updatedNotification.orderId,
            action: updatedNotification.action,
            read: updatedNotification.read,
            createdById: updatedNotification.createdById,
            createdAt: updatedNotification.createdAt.toISOString(),
            updatedAt: updatedNotification.updatedAt.toISOString(),
          };
          socket.emit('notification', {
            userId: driverId,
            notification: notificationData,
          });
          log(`WebSocket notification sent to driver ${driverId}:`, notificationData);
        }
      }

      //Логика уведомлений для операторов и администраторов
      let updatedAdminNotifications = [];
      if (
        (driverStatus === DriverAcceptanceStatus.ACCEPTED &&
          orderStatus === OrderStatus.IN_PROGRESS) ||
        (driverStatus === DriverAcceptanceStatus.TIMEOUT && orderStatus === OrderStatus.CANCELLED)
      ) {
        const adminsAndOperators = await prismaTx.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });

        updatedAdminNotifications = [];
        for (const user of adminsAndOperators) {
          const adminNotification = await prismaTx.notification.findFirst({
            where: { orderId: order.uuid, userId: user.uuid, action: Action.warning },
          });

          let notification;
          if (adminNotification) {
            const isAccepted = driverStatus === DriverAcceptanceStatus.ACCEPTED;
            notification = await prismaTx.notification.update({
              where: { uuid: adminNotification.uuid },
              data: {
                title: isAccepted ? 'Заказ принят водителем' : 'Заказ отклонён водителем',
                message: isAccepted
                  ? `Заказ #${order.uuid} был принят водителем после просрочки.`
                  : `Заказ #${order.uuid} был отклонён водителем после просрочки.`,
                action: isAccepted ? Action.info : Action.cancelled,
                read: false,
              },
            });
            log(`Updated admin notification for ${user.uuid}`);
          } else {
            const isAccepted = driverStatus === DriverAcceptanceStatus.ACCEPTED;
            notification = await prismaTx.notification.create({
              data: {
                uuid: uuidv4(),
                userId: user.uuid,
                title: isAccepted ? 'Заказ принят водителем' : 'Заказ отклонён водителем',
                message: isAccepted
                  ? `Заказ #${order.uuid} был принят водителем после просрочки.`
                  : `Заказ #${order.uuid} был отклонён водителем после просрочки.`,
                orderId: order.uuid,
                action: isAccepted ? Action.info : Action.cancelled,
                read: false,
                createdById: order.createdById,
              },
            });
            log(`Created new admin notification for ${user.uuid}`);
          }
          updatedAdminNotifications.push(notification);

          //Отправка WebSocket-уведомлений операторам и администраторам
          const notificationData = {
            uuid: notification.uuid,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            orderId: notification.orderId,
            action: notification.action,
            read: notification.read,
            createdById: notification.createdById,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
          };
          socket.emit('notification', {
            userId: notification.userId,
            notification: notificationData,
          });
          log(`WebSocket notification sent to ${notification.userId}:`, notificationData);
        }
      }

      return { updatedOrder, updatedDriver, updatedNotification, updatedAdminNotifications };
    });

    log(`Order ${uuid} updated:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error) {
    log('Error updating order and driver status:', error);
    return NextResponse.json({ error: 'Unable to update statuses' }, { status: 500 });
  }
}
