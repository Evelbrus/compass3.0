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

    const { updatedOrder, updatedDriver, previousDriverId } = await prisma.$transaction(
      async (prismaTx) => {
        const order = await prismaTx.order.findUnique({ where: { uuid } });
        if (!order) {
          log(`Заказ с UUID ${uuid} не найден`);
          throw new Error('Заказ не найден');
        }

        let driver = null;
        const previousDriverId = order.assignedDriverId; // Сохраняем текущего водителя

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
            orderStatus === OrderStatus.CANCELLED
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

        return { updatedOrder, updatedDriver, previousDriverId };
      },
      { timeout: 10000 },
    );

    const adminsAndOperators = await prisma.user.findMany({
      where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
    });

    // Логика уведомлений, основанная на шаблонах (исключая создание и просрочку)

    // Действия водителя
    if (driverById && driverStatus) {
      switch (driverStatus) {
        case DriverAcceptanceStatus.TAKEN:
          await processNotification({
            userId: driverById,
            orderId: updatedOrder.uuid,
            action: Action.noted,
            templateKey: 'orderNotedByDriver',
            createdById,
            driverById,
          });
          break;

        case DriverAcceptanceStatus.ACCEPTED:
          await processNotification({
            userId: driverById,
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressDriver',
            createdById,
            driverById,
          });
          await processNotification({
            userId: updatedOrder.createdById,
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderStatusChangedToClient',
            createdById,
            driverById,
          });
          break;

        case DriverAcceptanceStatus.ON_THE_WAY:
        case DriverAcceptanceStatus.ARRIVED:
        case DriverAcceptanceStatus.PICKED_UP:
          await processNotification({
            userId: driverById,
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressDriver',
            createdById,
            driverById,
          });
          await processNotification({
            userId: updatedOrder.createdById,
            orderId: updatedOrder.uuid,
            action: Action.inProgress,
            templateKey: 'orderInProgressClient',
            createdById,
            driverById,
          });
          break;

        case DriverAcceptanceStatus.COMPLETED:
          await processNotification({
            userId: driverById,
            orderId: updatedOrder.uuid,
            action: Action.success,
            templateKey: 'orderStatusChangedToClient',
            createdById,
            driverById,
          });
          await processNotification({
            userId: updatedOrder.createdById,
            orderId: updatedOrder.uuid,
            action: Action.success,
            templateKey: 'orderStatusChangedToClient',
            createdById,
            driverById,
          });
          break;

        case DriverAcceptanceStatus.TIMEOUT:
        case DriverAcceptanceStatus.PENDING:
          if (orderStatus === OrderStatus.CANCELLED) {
            await processNotification({
              userId: driverById,
              orderId: updatedOrder.uuid,
              action: Action.cancelled,
              templateKey: 'orderCancelledByDriverToDriver',
              createdById,
              driverById,
            });
            await processNotification({
              userId: updatedOrder.createdById,
              orderId: updatedOrder.uuid,
              action: Action.cancelled,
              templateKey: 'orderCancelledByDriverToClient',
              createdById,
              driverById,
            });
            if (adminsAndOperators.length > 0) {
              await processBulkNotifications({
                users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
                orderId: updatedOrder.uuid,
                action: Action.cancelled,
                templateKey: 'orderCancelledByDriverToAdmins',
                createdById,
                driverById,
              });
            }
          }
          break;
      }
    }

    // Обновление заказа админом
    if (orderStatus && !driverStatus && userId !== updatedOrder.createdById) {
      await processNotification({
        userId,
        orderId: updatedOrder.uuid,
        action: Action.info,
        templateKey: 'orderUpdatedByAdminToAdmin',
        createdById,
        driverById,
      });
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.info,
        templateKey: 'orderUpdatedByAdminToClient',
        createdById,
        driverById,
      });
    }

    // Отмена заказа админом
    if (
      orderStatus === OrderStatus.CANCELLED &&
      !driverStatus &&
      userId !== updatedOrder.createdById
    ) {
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderDeletedByAdminToClient',
        createdById,
        driverById,
      });
      if (driverById) {
        await processNotification({
          userId: driverById,
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderDeletedByAdminToDriver',
          createdById,
          driverById,
        });
      }
      await processNotification({
        userId,
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderDeletedByAdminToAdmin',
        createdById,
        driverById,
      });
    }

    // Обновление заказа клиентом
    if (orderStatus && !driverStatus && userId === updatedOrder.createdById) {
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.info,
        templateKey: 'orderUpdatedByCorpClientToClient',
        createdById,
        driverById,
      });
      if (adminsAndOperators.length > 0) {
        await processBulkNotifications({
          users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
          orderId: updatedOrder.uuid,
          action: Action.info,
          templateKey: 'orderUpdatedByCorpClientToAdmins',
          createdById,
          driverById,
        });
      }
    }

    // Отмена заказа клиентом
    if (
      orderStatus === OrderStatus.CANCELLED &&
      !driverStatus &&
      userId === updatedOrder.createdById
    ) {
      await processNotification({
        userId: updatedOrder.createdById,
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderCancelledByCorpClientToClient',
        createdById,
        driverById,
      });
      if (driverById) {
        await processNotification({
          userId: driverById,
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByCorpClientToDriver',
          createdById,
          driverById,
        });
      }
      if (adminsAndOperators.length > 0) {
        await processBulkNotifications({
          users: adminsAndOperators.map((user) => ({ uuid: user.uuid, role: user.role })),
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByCorpClientToAdmins',
          createdById,
          driverById,
        });
      }
    }

    // Смена водителя
    if (
      driverById &&
      driverById !== previousDriverId &&
      driverStatus === DriverAcceptanceStatus.ACCEPTED
    ) {
      if (previousDriverId) {
        await processNotification({
          userId: previousDriverId,
          orderId: updatedOrder.uuid,
          action: Action.info,
          templateKey: 'orderDriverRemoved',
          createdById,
          driverById,
        });
      }
      await processNotification({
        userId: driverById,
        orderId: updatedOrder.uuid,
        action: Action.inProgress,
        templateKey: 'orderUpdatedDriverReassigned',
        createdById,
        driverById,
      });
    }

    // Отметка уведомления как прочитанного
    if (markNotificationAsRead && action === Action.noted) {
      await prisma.notification.update({
        where: { uuid: notificationUuid },
        data: { read: true },
      });
      log(`Уведомление ${notificationUuid} помечено как прочитанное`);

      // Отправляем уведомление только инициатору действия
      await processNotification({
        userId,
        orderId: uuid,
        action: Action.noted,
        templateKey: userId === createdById ? 'orderNotedByClient' : 'orderNotedByAdmin',
        createdById,
        driverById, // Оставляем, но оно будет undefined из handleClose
        markNotificationAsRead: true,
      });

      // Убираем отправку водителю, если driverById есть
      // Если нужно уведомить водителя, это должно быть явно указано в другом месте
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
  } catch (error: unknown) {
    log('Ошибка при обновлении статуса заказа:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
