import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';
import { markNotificationAsRead } from '@next-app/src/services/notifications/markNotificationAsRead';
import { sendDriverCancelledNotification } from '@next-app/src/services/notifications/sendDriverNotifications';

export interface UpdateClientOrderStatusDTO {
  uuid: string; // UUID уведомления
  orderId: string; // ID заказа
  createdById: string | null; // ID пользователя, создавшего уведомление
  clientId: string | null; // ID клиента
  driverId: string | null; // ID водителя
  driverStatus?: DriverAcceptanceStatus; // Статус принятия водителем (опционально)
  orderStatus?: OrderStatus; // Статус заказа (опционально)
}

/**
 * Обновляет статус заказа от имени клиента с отправкой уведомлений
 * @param orderId Идентификатор заказа
 * @param data Данные обновления статуса
 * @returns Обновленный заказ
 */
export async function updateClientOrderStatusService(
  orderId: string,
  data: UpdateClientOrderStatusDTO,
) {
  // Маппинг полей из DTO
  const {
    driverStatus,
    orderStatus,
    createdById,
    clientId,
    driverId,
    uuid: notificationUuid,
  } = data;

  // Проверка наличия обязательных полей
  if (!orderStatus || !createdById || !clientId) {
    throw new Error('Отсутствуют обязательные поля: orderStatus, createdById, clientId');
  }

  // Найти заказ
  const order = await prisma.order.findUnique({
    where: { uuid: orderId },
    include: {
      clientBy: true,
      assignedDriver: true,
    },
  });

  if (!order) {
    throw new Error('Заказ не найден');
  }

  // Проверка, является ли пользователь создателем заказа
  if (order.clientById !== clientId) {
    throw new Error('Клиент не найден или не является создателем заказа');
  }

  try {
    // Обновление заказа в транзакции
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Обновляем статус заказа
      const order = await tx.order.update({
        where: { uuid: orderId },
        data: {
          status: orderStatus,
          driverAcceptanceStatus: driverStatus,
        },
        include: {
          assignedDriver: true,
          clientBy: true,
        },
      });

      // Отметить уведомление как прочитанное, если есть
      if (notificationUuid) {
        await markNotificationAsRead(notificationUuid);
      }

      return order;
    });

    // Если заказ отменен клиентом, отправляем уведомление водителю
    if (orderStatus === OrderStatus.CANCELLED && order.assignedDriverId) {
      await sendDriverCancelledNotification(orderId, order.assignedDriverId, createdById, clientId);
    }

    return {
      success: true,
      message: 'Статус заказа успешно обновлен',
      order: updatedOrder,
    };
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    throw error;
  }
}
