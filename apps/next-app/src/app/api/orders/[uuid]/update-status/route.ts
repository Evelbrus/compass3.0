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
import {
  processNotification,
  processBulkNotifications,
} from '@next-app/src/utils/notifications/notifications';
import { Params } from '@next-app/src/interface/interface';

const log = debug('app:orders:update-status');

interface UpdateOrderRequest {
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  notificationUuid: string;
  userId: string;
  createdById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  action: Action;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Обновление статуса для заказа UUID: ${uuid}`);

  try {
    const {
      driverStatus,
      orderStatus,
      userId,
      createdById,
      notificationUuid,
      markNotificationAsRead,
      action,
      driverById,
    }: UpdateOrderRequest = await req.json();

    log(`Полученные данные:`, {
      driverStatus: driverStatus ?? 'null',
      orderStatus: orderStatus ?? 'null',
      userId,
      createdById,
      notificationUuid,
      action,
      driverById: driverById ?? 'null',
      markNotificationAsRead: markNotificationAsRead ?? 'null',
    });

    if (!userId || !createdById || !notificationUuid || !action) {
      log(`Отсутствуют обязательные поля`);
      return NextResponse.json(
        {
          error: 'Отсутствуют обязательные поля: userId, createdById, notificationUuid или action',
        },
        { status: 400 },
      );
    }

    const { updatedOrder, updatedDriver } = await prisma.$transaction(
      async (prismaTx) => {
        const order = await prismaTx.order.findUnique({ where: { uuid } });
        if (!order) {
          log(`Заказ с UUID ${uuid} не найден`);
          throw new Error('Заказ не найден');
        }

        let driver = null;
        if (driverById) {
          driver = await prismaTx.user.findUnique({ where: { uuid: driverById } });
          if (!driver || driver.role !== UserRole.Driver) {
            throw new Error('Водитель не найден или не имеет роли Driver');
          }

          if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
            const activeOrders = await prismaTx.order.count({
              where: {
                assignedDriverId: driverById,
                status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
                NOT: { uuid: order.uuid },
              },
            });
            if (activeOrders > 0) {
              throw new Error(`Водитель занят другими активными заказами (${activeOrders})`);
            }
          }
        }

        const updatedOrder = await prismaTx.order.update({
          where: { uuid },
          data: {
            ...(orderStatus && { status: orderStatus }),
            ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
            ...(driverById !== undefined && { assignedDriverId: driverById }),
          },
        });

        let updatedDriver = null;
        if (driverById) {
          if (
            driverStatus === DriverAcceptanceStatus.COMPLETED ||
            driverStatus === DriverAcceptanceStatus.TIMEOUT ||
            orderStatus === OrderStatus.COMPLETED ||
            orderStatus === OrderStatus.CANCELLED ||
            orderStatus === OrderStatus.OVERDUE
          ) {
            const activeOrders = await prismaTx.order.count({
              where: {
                assignedDriverId: driverById,
                status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
                NOT: { uuid: updatedOrder.uuid },
              },
            });
            if (activeOrders === 0) {
              updatedDriver = await prismaTx.user.update({
                where: { uuid: driverById },
                data: { driverStatus: DriverStatus.FREE },
              });
              log(`Водитель ${driverById} установлен в FREE`);
            }
          } else if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
            updatedDriver = await prismaTx.user.update({
              where: { uuid: driverById },
              data: { driverStatus: DriverStatus.BUSY },
            });
            log(`Водитель ${driverById} установлен в BUSY`);
          }
        }

        return { updatedOrder, updatedDriver };
      },
      { timeout: 10000 },
    );

    if (notificationUuid) {
      const driverNotificationParams = {
        userId,
        orderId: updatedOrder.uuid,
        action,
        templateKey:
          driverStatus === DriverAcceptanceStatus.ACCEPTED
            ? 'orderCreatedDriverAssigned'
            : ('orderStatusChangedToClient' as const),
        createdById,
        driverById: driverById || updatedOrder.assignedDriverId,
        markNotificationAsRead,
      };
      await processNotification(driverNotificationParams);
      log(`Уведомление обновлено для ${userId}:`, driverNotificationParams);

      if (markNotificationAsRead) {
        await prisma.notification.update({
          where: { uuid: notificationUuid },
          data: { read: true },
        });
        log(`Уведомление ${notificationUuid} помечено как прочитанное`);
      }
    }

    if (driverStatus) {
      const clientNotificationParams = {
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action,
        templateKey: 'orderStatusChangedToClient',
        createdById,
        driverById: driverById || updatedOrder.assignedDriverId,
      };
      await processNotification(clientNotificationParams);
      log(`Уведомление отправлено клиенту ${updatedOrder.createdById}:`, clientNotificationParams);
    }

    // Отмена водителем до принятия (PENDING)
    if (driverStatus === DriverAcceptanceStatus.PENDING && orderStatus === OrderStatus.CANCELLED) {
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderCancelledByDriverToClient',
        createdById,
        driverById: driverById || updatedOrder.assignedDriverId,
      });
      if (driverById) {
        await processNotification({
          userId: driverById,
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByDriverToDriver',
          createdById,
          driverById,
        });
      }
      log(`Уведомления об отмене заказа водителем отправлены клиенту и водителю`);
    }

    // Отмена водителем после принятия (TIMEOUT)
    if (driverStatus === DriverAcceptanceStatus.TIMEOUT && orderStatus === OrderStatus.CANCELLED) {
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderCancelledByDriverToClient',
        createdById,
        driverById: driverById || updatedOrder.assignedDriverId,
      });
      if (driverById) {
        await processNotification({
          userId: driverById,
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByDriverToDriver',
          createdById,
          driverById,
        });
      }
      log(`Уведомления об отмене заказа водителем (TIMEOUT) отправлены клиенту и водителю`);
    }

    // Отмена клиентом
    if (
      orderStatus === OrderStatus.CANCELLED &&
      driverStatus !== DriverAcceptanceStatus.PENDING &&
      driverStatus !== DriverAcceptanceStatus.TIMEOUT
    ) {
      if (driverById) {
        const driverCancelParams = {
          userId: driverById,
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByCorpClientToDriver',
          createdById,
          driverById,
        };
        await processNotification(driverCancelParams);
        log(`Уведомление об отмене отправлено водителю ${driverById}:`, driverCancelParams);
      }

      const adminsAndOperators = await prisma.user.findMany({
        where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
      });
      if (adminsAndOperators.length > 0) {
        await processBulkNotifications({
          users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByCorpClientToAdmins',
          createdById,
          driverById: driverById || updatedOrder.assignedDriverId,
        });
        log(`Уведомления об отмене заказа клиентом отправлены админам и операторам`);
      }
    }

    // Остальные условия для других случаев (ACCEPTED, OVERDUE и т.д.) остаются без изменений
    if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
      const isOverdue = new Date(updatedOrder.departureTime).getTime() < Date.now();
      if (isOverdue) {
        const adminsAndOperators = await prisma.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });
        if (adminsAndOperators.length > 0) {
          await processBulkNotifications({
            users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
            orderId: updatedOrder.uuid,
            action: Action.info,
            templateKey: 'orderOverdueAcceptedByDriverToAdmins',
            createdById,
            driverById: driverById || updatedOrder.assignedDriverId,
          });
          log(`Уведомления о принятии просроченного заказа отправлены админам и операторам`);
        }
      }
    }

    if (
      (driverStatus === DriverAcceptanceStatus.ACCEPTED &&
        orderStatus === OrderStatus.IN_PROGRESS) ||
      (driverStatus === DriverAcceptanceStatus.TIMEOUT && orderStatus === OrderStatus.CANCELLED)
    ) {
      const isOverdue =
        updatedOrder.status === OrderStatus.OVERDUE ||
        new Date(updatedOrder.departureTime).getTime() < Date.now();
      if (!isOverdue) {
        const adminsAndOperators = await prisma.user.findMany({
          where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
        });
        if (adminsAndOperators.length > 0) {
          const templateKey =
            driverStatus === DriverAcceptanceStatus.ACCEPTED
              ? 'orderCreatedByCorpClientToAdmins'
              : 'orderOverdueAdmin';
          await processBulkNotifications({
            users: adminsAndOperators,
            orderId: updatedOrder.uuid,
            action: isOverdue ? Action.warning : Action.info,
            templateKey,
            createdById,
            driverById: driverById || updatedOrder.assignedDriverId,
          });
          log(`Массовые уведомления отправлены администраторам`);
        }
      }
    }

    const verifiedOrder = await prisma.order.findUnique({ where: { uuid } });
    if (
      (orderStatus && verifiedOrder?.status !== orderStatus) ||
      (driverStatus && verifiedOrder?.driverAcceptanceStatus !== driverStatus)
    ) {
      throw new Error('Не удалось зафиксировать изменения заказа в базе данных');
    }

    const updatedData = { updatedOrder, updatedDriver, updatedAdminNotifications: [] };
    log(`Заказ ${uuid} успешно обновлён:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error) {
    log('Ошибка при обновлении статуса заказа:', error);
    throw error;
  }
}
