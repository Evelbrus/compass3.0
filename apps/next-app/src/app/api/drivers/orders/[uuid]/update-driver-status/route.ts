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

const log = debug('app:orders:update-driver-status');

interface UpdateDriverOrderRequest {
  orderUuid: string;
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
  log(`Обновление статуса для заказа UUID: ${uuid} водителем`);

  try {
    const {
      driverStatus,
      orderStatus,
      userId,
      createdById,
      notificationUuid,
      markNotificationAsRead,
      action,
    }: UpdateDriverOrderRequest = await req.json();

    log(`Полученные данные:`, {
      driverStatus: driverStatus ?? 'null',
      orderStatus: orderStatus ?? 'null',
      userId,
      createdById,
      notificationUuid,
      action,
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

    const { updatedOrder, updatedDriver, originalStatus } = await prisma.$transaction(
      async (prismaTx) => {
        const order = await prismaTx.order.findUnique({ where: { uuid } });
        if (!order) {
          log(`Заказ с UUID ${uuid} не найден`);
          throw new Error('Заказ не найден');
        }

        const originalStatus = order.status; // Сохраняем исходный статус заказа

        const driver = await prismaTx.user.findUnique({ where: { uuid: userId } });
        if (!driver || driver.role !== UserRole.Driver) {
          throw new Error('Водитель не найден или не имеет роли Driver');
        }

        if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
          const activeOrders = await prismaTx.order.count({
            where: {
              assignedDriverId: userId,
              status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
              NOT: { uuid: order.uuid },
            },
          });
          if (activeOrders > 0) {
            throw new Error(`Водитель занят другими активными заказами (${activeOrders})`);
          }
        }

        const updatedOrder = await prismaTx.order.update({
          where: { uuid },
          data: {
            ...(orderStatus && { status: orderStatus }),
            ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
            assignedDriverId: userId,
          },
        });

        let updatedDriver = null;
        if (
          driverStatus === DriverAcceptanceStatus.COMPLETED ||
          driverStatus === DriverAcceptanceStatus.PENDING ||
          orderStatus === OrderStatus.COMPLETED ||
          orderStatus === OrderStatus.CANCELLED
        ) {
          const activeOrders = await prismaTx.order.count({
            where: {
              assignedDriverId: userId,
              status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
              NOT: { uuid: updatedOrder.uuid },
            },
          });
          if (activeOrders === 0) {
            updatedDriver = await prismaTx.user.update({
              where: { uuid: userId },
              data: { driverStatus: DriverStatus.FREE },
            });
            log(`Водитель ${userId} установлен в FREE`);
          }
        } else if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
          updatedDriver = await prismaTx.user.update({
            where: { uuid: userId },
            data: { driverStatus: DriverStatus.BUSY },
          });
          log(`Водитель ${userId} установлен в BUSY`);
        }

        return { updatedOrder, updatedDriver, originalStatus }; // Возвращаем исходный статус
      },
    );

    // Логика уведомлений для действий водителя
    if (driverStatus) {
      switch (driverStatus) {
        case DriverAcceptanceStatus.TAKEN:
          await processNotification({
            userId, // Водитель
            orderId: updatedOrder.uuid,
            action: Action.noted,
            templateKey: 'orderNotedByDriver',
            createdById,
            markNotificationAsRead: true,
          });
          break;

        case DriverAcceptanceStatus.ACCEPTED:
          await processNotification({
            userId, // Водитель
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressDriver',
            createdById,
          });

          // Уведомление клиенту отправляем только если заказ НЕ просрочен после обновления
          if (updatedOrder.status !== OrderStatus.OVERDUE) {
            await processNotification({
              userId: createdById, // Клиент
              orderId: updatedOrder.uuid,
              action: Action.inProgress,
              templateKey: 'orderStatusChangedToClient',
              createdById,
            });
          }

          // Уведомление админам, если заказ БЫЛ просрочен до принятия
          if (originalStatus === OrderStatus.OVERDUE) {
            log(`Заказ ${updatedOrder.uuid} был просрочен, отправляем уведомление админам`);
            const adminsAndOperators = await prisma.user.findMany({
              where: { role: { in: [UserRole.Admin, UserRole.Operator] } },
              select: { uuid: true, role: true },
            });
            if (adminsAndOperators.length > 0) {
              await processBulkNotifications({
                users: adminsAndOperators,
                orderId: updatedOrder.uuid,
                action: Action.info,
                templateKey: 'orderOverdueAcceptedByDriverToAdmins',
                createdById,
                driverById: userId,
              });
              log(`Уведомление админам отправлено для заказа ${updatedOrder.uuid}`);
            } else {
              log(`Админы или операторы не найдены для уведомления`);
            }
          }
          break;

        case DriverAcceptanceStatus.ON_THE_WAY:
        case DriverAcceptanceStatus.ARRIVED:
        case DriverAcceptanceStatus.PICKED_UP:
          await processNotification({
            userId, // Водитель
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressDriver',
            createdById,
          });
          await processNotification({
            userId: createdById, // Клиент
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressClient',
            createdById,
          });
          break;

        case DriverAcceptanceStatus.COMPLETED:
          await processNotification({
            userId, // Водитель
            orderId: updatedOrder.uuid,
            action: Action.success,
            templateKey: 'orderStatusChangedToClient',
            createdById,
          });
          await processNotification({
            userId: createdById, // Клиент
            orderId: updatedOrder.uuid,
            action: Action.success,
            templateKey: 'orderStatusChangedToClient',
            createdById,
          });
          break;

        case DriverAcceptanceStatus.PENDING:
          if (orderStatus === OrderStatus.CANCELLED) {
            await processNotification({
              userId, // Водитель
              orderId: updatedOrder.uuid,
              action: Action.cancelled,
              templateKey: 'orderCancelledByDriverToDriver',
              createdById,
            });
            await processNotification({
              userId: createdById, // Клиент
              orderId: updatedOrder.uuid,
              action: Action.cancelled,
              templateKey: 'orderCancelledByDriverToClient',
              createdById,
            });
            const adminsAndOperators = await prisma.user.findMany({
              where: { role: { in: [UserRole.Admin, UserRole.Operator] } },
              select: { uuid: true, role: true },
            });
            if (adminsAndOperators.length > 0) {
              await processBulkNotifications({
                users: adminsAndOperators,
                orderId: updatedOrder.uuid,
                action: Action.info,
                templateKey: 'orderCancelledByDriverToAdmins',
                createdById,
                driverById: userId,
              });
            }
          }
          break;
      }
    }

    // Отметка уведомления как прочитанного
    if (markNotificationAsRead && action === Action.noted) {
      await prisma.notification.update({
        where: { uuid: notificationUuid },
        data: { read: true },
      });
      log(`Уведомление ${notificationUuid} помечено как прочитанное`);
      await processNotification({
        userId, // Только водитель
        orderId: uuid,
        action: Action.noted,
        templateKey: 'orderNotedByDriver',
        createdById,
        markNotificationAsRead: true,
      });
    }

    const updatedData = { updatedOrder, updatedDriver };
    log(`Заказ ${uuid} успешно обновлён водителем:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error: unknown) {
    log('Ошибка при обновлении статуса заказа водителем:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
