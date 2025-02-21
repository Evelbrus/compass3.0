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
import { socket } from '@socket-server';

const log = debug('app:orders:update-status');

interface Params {
  uuid: string;
}

const stages: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидание принятия заказа водителем',
  TAKEN: 'Водитель уведомлён о заказе',
  ACCEPTED: 'Заказ принят водителем',
  ON_THE_WAY: 'Водитель едет к вам',
  ARRIVED: 'Водитель прибыл к месту',
  PICKED_UP: 'Поездка началась',
  COMPLETED: 'Поездка завершена',
  TIMEOUT: 'Время ожидания истекло',
};

interface UpdateOrderRequest {
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  driverId?: string;
  notificationUuid?: string;
  markNotificationAsRead?: boolean;
  action?: Action;
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
    }: UpdateOrderRequest = await req.json();

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
        const currentNotification = await prismaTx.notification.findUnique({
          where: { uuid: notificationUuid },
        });
        if (!currentNotification) {
          log(`Notification with UUID ${notificationUuid} not found`);
          throw new Error('Notification not found');
        }

        updatedNotification = await prismaTx.notification.update({
          where: { uuid: notificationUuid },
          data: {
            read: true,
            ...(action && { action }),
            message: driverStatus
              ? `Статус заказа #${uuid}: ${stages[driverStatus]}`
              : currentNotification.message,
            updatedAt: new Date(),
          },
        });
        log(`Updated driver notification:`, updatedNotification);

        const driverNotificationData = {
          uuid: updatedNotification.uuid,
          userId: driverId ?? updatedNotification.userId,
          driverById: driverId ?? updatedNotification.driverById,
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
          userId: driverId ?? updatedNotification.userId,
          notification: driverNotificationData,
        });
        log(
          `WebSocket notification sent to driver ${driverId ?? updatedNotification.userId}:`,
          driverNotificationData,
        );
      }

      if (driverStatus) {
        let clientNotification = await prismaTx.notification.findFirst({
          where: {
            orderId: order.uuid,
            userId: order.createdById,
          },
        });

        if (clientNotification) {
          clientNotification = await prismaTx.notification.update({
            where: { uuid: clientNotification.uuid },
            data: {
              title: 'Обновление статуса заказа',
              message: `Статус заказа #${uuid}: ${stages[driverStatus]}`,
              action: action || Action.inProgress,
              read: false,
              updatedAt: new Date(),
            },
          });
          log(`Updated client notification:`, clientNotification);

          const clientNotificationData = {
            uuid: clientNotification.uuid,
            userId: clientNotification.userId,
            driverById: driverId ?? null,
            title: clientNotification.title,
            message: clientNotification.message,
            orderId: clientNotification.orderId,
            action: clientNotification.action,
            read: clientNotification.read,
            createdById: clientNotification.createdById,
            createdAt: clientNotification.createdAt.toISOString(),
            updatedAt: clientNotification.updatedAt.toISOString(),
          };
          socket.emit('notification', {
            userId: order.createdById,
            notification: clientNotificationData,
          });
          log(
            `WebSocket notification sent to client ${order.createdById}:`,
            clientNotificationData,
          );
        } else {
          log(`Client notification for order ${uuid} not found, skipping creation`);
        }
      }

      //Уведомление клиента при отклонении заказа водителем
      if (
        driverStatus === DriverAcceptanceStatus.TIMEOUT &&
        orderStatus === OrderStatus.CANCELLED
      ) {
        let clientNotification = await prismaTx.notification.findFirst({
          where: {
            orderId: order.uuid,
            userId: order.createdById,
          },
        });

        if (clientNotification) {
          clientNotification = await prismaTx.notification.update({
            where: { uuid: clientNotification.uuid },
            data: {
              title: 'Заказ отклонён водителем',
              message: `Заказ #${uuid} был отклонён водителем после просрочки.`,
              action: Action.cancelled,
              read: false,
              updatedAt: new Date(),
            },
          });
          const clientNotificationData = {
            uuid: clientNotification.uuid,
            userId: clientNotification.userId,
            driverById: driverId ?? null,
            title: clientNotification.title,
            message: clientNotification.message,
            orderId: clientNotification.orderId,
            action: clientNotification.action,
            read: clientNotification.read,
            createdById: clientNotification.createdById,
            createdAt: clientNotification.createdAt.toISOString(),
            updatedAt: clientNotification.updatedAt.toISOString(),
          };
          socket.emit('notification', {
            userId: order.createdById,
            notification: clientNotificationData,
          });
          log(
            `WebSocket notification sent to client ${order.createdById}:`,
            clientNotificationData,
          );
        } else {
          log(`Client notification for order ${uuid} not found, skipping creation`);
        }
      }

      if (orderStatus === OrderStatus.CANCELLED && driverId) {
        let driverCancelNotification = await prismaTx.notification.findFirst({
          where: {
            orderId: order.uuid,
            userId: driverId,
          },
        });

        if (driverCancelNotification) {
          driverCancelNotification = await prismaTx.notification.update({
            where: { uuid: driverCancelNotification.uuid },
            data: {
              title: 'Заказ отменён пользователем',
              message: `Заказ #${uuid} был отменён пользователем.`,
              action: Action.cancelled,
              read: false,
              updatedAt: new Date(),
            },
          });
          log(`Updated driver cancel notification:`, driverCancelNotification);

          const driverCancelNotificationData = {
            uuid: driverCancelNotification.uuid,
            userId: driverCancelNotification.userId,
            driverById: driverId,
            title: driverCancelNotification.title,
            message: driverCancelNotification.message,
            orderId: driverCancelNotification.orderId,
            action: driverCancelNotification.action,
            read: driverCancelNotification.read,
            createdById: driverCancelNotification.createdById,
            createdAt: driverCancelNotification.createdAt.toISOString(),
            updatedAt: driverCancelNotification.updatedAt.toISOString(),
          };
          socket.emit('notification', {
            userId: driverId,
            notification: driverCancelNotificationData,
          });
          log(
            `WebSocket cancel notification sent to driver ${driverId}:`,
            driverCancelNotificationData,
          );
        } else {
          log(`Driver cancel notification for order ${uuid} not found, skipping creation`);
        }
      }

      let updatedAdminNotifications = [];
      if (
        driverStatus === DriverAcceptanceStatus.ACCEPTED &&
        orderStatus === OrderStatus.IN_PROGRESS
      ) {
        const isOverdue =
          order.status === OrderStatus.OVERDUE ||
          new Date(order.departureTime).getTime() < Date.now();

        if (isOverdue) {
          const adminsAndOperators = await prismaTx.user.findMany({
            where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
          });

          updatedAdminNotifications = [];
          for (const user of adminsAndOperators) {
            const adminNotification = await prismaTx.notification.findFirst({
              where: { orderId: order.uuid, userId: user.uuid },
            });

            if (adminNotification) {
              const notification = await prismaTx.notification.update({
                where: { uuid: adminNotification.uuid },
                data: {
                  title: 'Заказ принят водителем',
                  message: `Заказ #${order.uuid} был принят водителем после просрочки.`,
                  action: Action.info,
                  read: false,
                  updatedAt: new Date(),
                },
              });
              log(`Updated admin notification for ${user.uuid}`);

              const notificationData = {
                uuid: notification.uuid,
                userId: notification.userId,
                driverById: driverId ?? null,
                title: notification.title,
                message: notification.message,
                orderId: notification.orderId,
                action: notification.action,
                read: notification.read,
                createdById: notification.createdById,
                createdAt: notification.createdAt.toISOString(),
                updatedAt: notification.updatedAt.toISOString(),
              };
              socket.emit('notification', {
                userId: notification.userId,
                notification: notificationData,
              });
              log(`WebSocket notification sent to ${notification.userId}:`, notificationData);
              updatedAdminNotifications.push(notification);
            } else {
              log(
                `Admin notification for order ${uuid} and user ${user.uuid} not found, skipping creation`,
              );
            }
          }
        }
      } else if (
        driverStatus === DriverAcceptanceStatus.TIMEOUT &&
        orderStatus === OrderStatus.CANCELLED
      ) {
        const adminsAndOperators = await prismaTx.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });

        updatedAdminNotifications = [];
        for (const user of adminsAndOperators) {
          const adminNotification = await prismaTx.notification.findFirst({
            where: { orderId: order.uuid, userId: user.uuid },
          });

          if (adminNotification) {
            const notification = await prismaTx.notification.update({
              where: { uuid: adminNotification.uuid },
              data: {
                title: 'Заказ отклонён водителем',
                message: `Заказ #${order.uuid} был отклонён водителем после просрочки.`,
                action: Action.cancelled,
                read: false,
                updatedAt: new Date(),
              },
            });
            log(`Updated admin notification for ${user.uuid}`);

            const notificationData = {
              uuid: notification.uuid,
              userId: notification.userId,
              driverById: driverId ?? null,
              title: notification.title,
              message: notification.message,
              orderId: notification.orderId,
              action: notification.action,
              read: notification.read,
              createdById: notification.createdById,
              createdAt: notification.createdAt.toISOString(),
              updatedAt: notification.updatedAt.toISOString(),
            };
            socket.emit('notification', {
              userId: notification.userId,
              notification: notificationData,
            });
            log(`WebSocket notification sent to ${notification.userId}:`, notificationData);
            updatedAdminNotifications.push(notification);
          } else {
            log(
              `Admin notification for order ${uuid} and user ${user.uuid} not found, skipping creation`,
            );
          }
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
