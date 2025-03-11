import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus, UserRole } from '@prisma/client';
import {
  sendDriverAcceptedNotification,
  sendDriverCancelledNotification,
} from '@next-app/src/services/notifications/sendDriverNotifications';

export interface UpdateOrderStatusDTO {
  uuid: string; // UUID уведомления
  orderId: string; // ID заказа
  createdById: string | null; // ID пользователя, создавшего уведомление
  clientId: string | null; // ID клиента
  driverId: string | null; // ID водителя
  driverStatus?: DriverAcceptanceStatus; // Статус принятия водителем (опционально)
  orderStatus?: OrderStatus; // Статус заказа (опционально)
}

/**
 * Обновляет статус заказа от имени администратора с отправкой уведомлений
 * @param orderId Идентификатор заказа
 * @param data Данные обновления статуса
 * @returns Обновленный заказ
 */
export async function updateOrderStatusService(orderId: string, data: UpdateOrderStatusDTO) {
  const { orderStatus, driverStatus, driverId, createdById } = data;

  // Проверка наличия обязательных полей
  if (!orderStatus || !createdById) {
    throw new Error('Отсутствуют обязательные поля: orderStatus, adminId');
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

  // Проверка назначаемого водителя, если он указан
  if (driverId) {
    const driver = await prisma.user.findUnique({
      where: { uuid: driverId },
    });

    if (!driver || driver.role !== UserRole.Driver) {
      throw new Error('Водитель не найден или не имеет роли Driver');
    }

    // Проверка, не занят ли водитель другими заказами
    if (driverId !== order.assignedDriverId) {
      const activeOrdersCount = await prisma.order.count({
        where: {
          assignedDriverId: driverId,
          status: {
            in: [OrderStatus.IN_PROGRESS],
          },
          uuid: {
            not: orderId, // не учитываем текущий заказ
          },
        },
      });

      if (activeOrdersCount > 0) {
        throw new Error('Водитель занят другими активными заказами');
      }
    }
  }

  try {
    // Данные для обновления
    const updateData: any = {
      status: orderStatus,
    };

    // Добавляем статус водителя, если указан
    if (driverStatus) {
      updateData.driverAcceptanceStatus = driverStatus;
    }

    // Если указан водитель, назначаем его
    if (typeof driverId !== 'undefined') {
      updateData.assignedDriverId = driverId;
    }

    // Обновляем заказ
    const updatedOrder = await prisma.order.update({
      where: { uuid: orderId },
      data: updateData,
      include: {
        assignedDriver: true,
        clientBy: true,
      },
    });

    // Отправляем уведомления о назначении/отмене водителя
    if (driverId && driverId !== order.assignedDriverId) {
      // Если назначен новый водитель
      await sendDriverAcceptedNotification(orderId, driverId, createdById, order.clientById);
    } else if (orderStatus === OrderStatus.CANCELLED && order.assignedDriverId) {
      // Если заказ отменен администратором
      await sendDriverCancelledNotification(
        orderId,
        order.assignedDriverId,
        createdById,
        order.clientById,
      );
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
