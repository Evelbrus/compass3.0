// app/src/services/orders/updateOrderStatus.ts
import { prisma } from '@shared/prisma/prisma-client';
import {
  DriverAcceptanceStatus,
  OrderStatus,
  UserRole,
  DriverStatus,
  Action,
  User,
  Order,
} from '@prisma/client';
import debug from 'debug';
import {
  UpdateOrderStatusDTO,
  UpdateOrderStatusResultDTO,
} from '@next-app/src/dto/orders/order-status.dto';
import {
  processNotification,
  processBulkNotifications,
} from '@next-app/src/utils/notifications/notifications';

const logError = debug('app:services:orders:error');
const log = debug('app:orders:update-status');

// Типизированный интерфейс для параметров функции уведомлений
interface NotificationParams {
  updatedOrder: Order;
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  userId: string;
  createdById: string;
  driverById?: string;
  adminsAndOperators: User[];
  previousDriverId: string | null;
  action: Action;
}

export async function updateOrderStatus(
  uuid: string,
  data: UpdateOrderStatusDTO,
): Promise<UpdateOrderStatusResultDTO> {
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
      readOnly, // Получаем флаг readOnly
      originalAction, // Получаем оригинальный тип действия
    } = data;

    log(`Полученные данные:`, {
      driverStatus: driverStatus ?? 'null',
      orderStatus: orderStatus ?? 'null',
      userId,
      createdById,
      notificationUuid,
      action,
      driverById: driverById ?? 'null',
      markNotificationAsRead: markNotificationAsRead ?? 'null',
      readOnly: readOnly ?? 'false',
      originalAction: originalAction ?? 'null',
    });

    if (!userId || !createdById || !notificationUuid || !action) {
      logError('× Отсутствуют обязательные поля');
      throw new Error(
        'Отсутствуют обязательные поля: userId, createdById, notificationUuid или action',
      );
    }

    // Если это только отметка о прочтении, выполняем упрощенную логику без изменения заказа
    if (readOnly === true) {
      log('Запрос только для отметки уведомления как прочитанного (readOnly=true)');

      // Проверяем существование уведомления
      const notification = await prisma.notification.findUnique({
        where: { uuid: notificationUuid },
      });

      if (!notification) {
        throw new Error('Уведомление не найдено');
      }

      // Проверяем существование заказа (просто для валидации)
      const order = await prisma.order.findUnique({ where: { uuid } });
      if (!order) {
        throw new Error('Заказ не найден');
      }

      // Отмечаем уведомление как прочитанное
      if (markNotificationAsRead) {
        await prisma.notification.update({
          where: { uuid: notificationUuid },
          data: { read: true },
        });
        log(`Уведомление ${notificationUuid} помечено как прочитанное (readOnly режим)`);
      }

      // Возвращаем данные без изменения статуса заказа
      return {
        updatedOrder: order,
        updatedDriver: null,
        updatedAdminNotifications: [],
        notificationMarkedAsRead: markNotificationAsRead || false,
      };
    }

    // Транзакция для обновления заказа и водителя
    const { updatedOrder, updatedDriver, previousDriverId } = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({ where: { uuid } });
        if (!order) {
          logError(`× Заказ с UUID ${uuid} не найден`);
          throw new Error('Заказ не найден');
        }

        let driver = null;
        const previousDriverId = order.assignedDriverId; // Сохраняем текущего водителя

        if (driverById) {
          driver = await tx.user.findUnique({ where: { uuid: driverById } });
          if (!driver || driver.role !== UserRole.Driver) {
            logError(`× Водитель ${driverById} не найден или не имеет роли Driver`);
            throw new Error('Водитель не найден или не имеет роли Driver');
          }

          if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
            const activeOrders = await tx.order.count({
              where: {
                assignedDriverId: driverById,
                status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
                NOT: { uuid: order.uuid },
              },
            });
            if (activeOrders > 0) {
              logError(
                `× Водитель ${driverById} занят другими активными заказами (${activeOrders})`,
              );
              throw new Error(`Водитель занят другими активными заказами (${activeOrders})`);
            }
          }
        }

        const updatedOrder = await tx.order.update({
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
            const activeOrders = await tx.order.count({
              where: {
                assignedDriverId: driverById,
                status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
                NOT: { uuid: updatedOrder.uuid },
              },
            });
            if (activeOrders === 0) {
              updatedDriver = await tx.user.update({
                where: { uuid: driverById },
                data: { driverStatus: DriverStatus.FREE },
              });
              log(`Водитель ${driverById} установлен в FREE`);
            }
          } else if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
            updatedDriver = await tx.user.update({
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

    // Получение админов и операторов для отправки уведомлений
    const adminsAndOperators = await prisma.user.findMany({
      where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
    });

    // Логика уведомлений, основанная на шаблонах
    await sendNotificationsBasedOnStatus({
      updatedOrder,
      driverStatus,
      orderStatus,
      userId,
      createdById,
      driverById,
      adminsAndOperators,
      previousDriverId,
      action,
    });

    // Отметка уведомления как прочитанного
    if (markNotificationAsRead) {
      // Получаем текущее уведомление для сохранения его типа действия
      const currentNotification = await prisma.notification.findUnique({
        where: { uuid: notificationUuid },
      });

      if (!currentNotification) {
        throw new Error('Уведомление не найдено');
      }

      // Используем originalAction, если передан, иначе сохраняем текущий тип действия
      const actionToPreserve = originalAction || currentNotification.action;

      // Обновляем уведомление, отмечая его как прочитанное
      await prisma.notification.update({
        where: { uuid: notificationUuid },
        data: { read: true },
      });
      log(`Уведомление ${notificationUuid} помечено как прочитанное`);

      // Создаем уведомление о прочтении только для действий, требующих подтверждения
      if (['inProgress', 'success', 'warning', 'info'].includes(actionToPreserve)) {
        // Уведомляем только инициатора действия о том, что уведомление прочитано,
        // но сохраняем оригинальный тип действия в истории
        await processNotification({
          userId,
          orderId: uuid,
          action: actionToPreserve, // Используем сохраненный тип действия
          templateKey:
            userId === createdById
              ? 'orderNotedByClient'
              : userId === driverById
                ? 'orderNotedByDriver'
                : 'orderNotedByAdmin',
          createdById,
          driverById,
          markNotificationAsRead: true,
        });
      }
    }

    // Проверяем, что изменения были применены
    const verifiedOrder = await prisma.order.findUnique({ where: { uuid } });
    if (
      (orderStatus && verifiedOrder?.status !== orderStatus) ||
      (driverStatus && verifiedOrder?.driverAcceptanceStatus !== driverStatus)
    ) {
      logError('× Не удалось зафиксировать изменения заказа в базе данных');
      throw new Error('Не удалось зафиксировать изменения заказа в базе данных');
    }

    return {
      updatedOrder,
      updatedDriver,
      updatedAdminNotifications: [],
      previousDriverId,
      notificationMarkedAsRead: markNotificationAsRead || false,
    };
  } catch (error) {
    logError('× Ошибка при обновлении статуса заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}

// Вспомогательная функция для отправки уведомлений в зависимости от статуса заказа
async function sendNotificationsBasedOnStatus(params: NotificationParams): Promise<void> {
  const {
    updatedOrder,
    driverStatus,
    orderStatus,
    userId,
    createdById,
    driverById,
    adminsAndOperators,
    previousDriverId,
    action,
  } = params;

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
              users: adminsAndOperators.map((user: User) => ({ uuid: user.uuid, role: user.role })),
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
        users: adminsAndOperators.map((user: User) => ({ uuid: user.uuid, role: user.role })),
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
        users: adminsAndOperators.map((user: User) => ({ uuid: user.uuid, role: user.role })),
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
}
