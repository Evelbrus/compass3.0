import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';
import { markNotificationAsRead } from '@next-app/src/services/notifications/markNotificationAsRead';
import {
  sendDriverAcceptedNotification,
  sendDriverArrivedNotification,
  sendDriverStartedNotification,
  sendDriverPickedUpNotification,
  sendDriverCompletedNotification,
  sendDriverCancelledNotification,
  sendDriverTimeoutNotification,
  CancellationSource,
} from '@next-app/src/services/notifications/sendDriverNotifications';

export interface UpdateDriverOrderStatusDTO {
  uuid: string; // UUID уведомления
  orderId: string; // ID заказа
  createdById: string | null; // ID пользователя, создавшего уведомление
  clientId: string | null; // ID клиента
  driverId: string | null; // ID водителя
  driverStatus?: DriverAcceptanceStatus; // Статус принятия водителем (опционально)
  orderStatus?: OrderStatus; // Статус заказа (опционально)
  cancel?: CancellationSource; // Флаг, указывающий, что заказ отменен клиентом
}

/**
 * Обновляет статус заказа от имени водителя с отправкой уведомлений
 * @param orderId Идентификатор заказа
 * @param data Данные обновления статуса
 * @returns Обновленный заказ
 */
export async function updateDriverOrderStatusService(
  orderId: string,
  data: UpdateDriverOrderStatusDTO,
) {
  const {
    driverStatus,
    orderStatus,
    createdById,
    clientId,
    driverId,
    uuid: notificationUuid,
    cancel = CancellationSource.DRIVER,
  } = data;

  console.log('updateDriverOrderStatusService', data);

  if (!driverStatus || !orderStatus || !createdById || !clientId) {
    throw new Error(
      'Отсутствуют обязательные поля: driverStatus, orderStatus, createdById, clientId',
    );
  }

  const order = await prisma.order.findUnique({
    where: { uuid: orderId },
    include: {
      assignedDriver: true,
    },
  });

  if (!order) {
    throw new Error('Заказ не найден');
  }

  if (!driverId) {
    throw new Error('Водитель не найден или не имеет роли Driver');
  }

  if (driverStatus === DriverAcceptanceStatus.ACCEPTED && order.assignedDriverId !== driverId) {
    const activeOrdersCount = await prisma.order.count({
      where: {
        assignedDriverId: driverId,
        status: {
          in: [OrderStatus.IN_PROGRESS],
        },
        uuid: {
          not: orderId,
        },
      },
    });

    if (activeOrdersCount > 0) {
      throw new Error('Водитель занят другими активными заказами');
    }
  }

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const orderUpdate = await tx.order.update({
        where: { uuid: orderId },
        data: {
          status: orderStatus,
          driverAcceptanceStatus: driverStatus,
          ...(driverStatus === DriverAcceptanceStatus.ACCEPTED
            ? { assignedDriverId: driverId }
            : {}),
        },
        include: {
          assignedDriver: true,
          clientBy: true,
        },
      });

      if (notificationUuid) {
        await markNotificationAsRead(notificationUuid);
      }

      return orderUpdate;
    });

    // Отправка уведомлений в зависимости от действия водителя
    switch (driverStatus) {
      case DriverAcceptanceStatus.ACCEPTED:
        // Передаем исходный статус заказа (order.status)
        await sendDriverAcceptedNotification(
          orderId,
          driverId,
          createdById,
          clientId,
          order.driverAcceptanceStatus,
        );
        break;
      case DriverAcceptanceStatus.ARRIVED:
        await sendDriverArrivedNotification(orderId, driverId, createdById, clientId);
        break;
      case DriverAcceptanceStatus.ON_THE_WAY:
        await sendDriverStartedNotification(orderId, driverId, createdById, clientId);
        break;
      case DriverAcceptanceStatus.PICKED_UP:
        await sendDriverPickedUpNotification(orderId, driverId, createdById, clientId);
        break;
      case DriverAcceptanceStatus.COMPLETED:
        await sendDriverCompletedNotification(orderId, driverId, createdById, clientId);
        break;
      case DriverAcceptanceStatus.TIMEOUT:
        await sendDriverTimeoutNotification(orderId, driverId, createdById, clientId);
        break;
    }

    if (orderStatus === OrderStatus.CANCELLED) {
      await sendDriverCancelledNotification(orderId, driverId, createdById, clientId, cancel);
    } else if (orderStatus === OrderStatus.OVERDUE) {
      await sendDriverTimeoutNotification(orderId, driverId, createdById, clientId);
    }

    return {
      success: true,
      message: 'Статус заказа успешно обновлен',
      order: updatedOrder,
    };
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    throw new Error('Не удалось зафиксировать изменения заказа в базе данных');
  }
}
