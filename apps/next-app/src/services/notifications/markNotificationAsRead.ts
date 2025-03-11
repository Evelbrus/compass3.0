import { prisma } from '@shared/prisma/prisma-client';
import { socket, ensureSocketConnection } from '@next-app/src/services/notifications/notifications';

/**
 * Отмечает уведомление как прочитанное
 * @param notificationUuid Идентификатор уведомления
 * @returns Обновленное уведомление
 */
export async function markNotificationAsRead(notificationUuid: string) {
  try {
    // Проверяем, существует ли уведомление
    const notification = await prisma.notification.findUnique({
      where: { uuid: notificationUuid },
    });
    if (!notification) {
      throw new Error('Уведомление не найдено');
    }
    // Обновляем уведомление
    const updatedNotification = await prisma.notification.update({
      where: { uuid: notificationUuid },
      data: { read: true }, // Исправлено на true
    });
    // Отправляем обновление через веб-сокет
    if (ensureSocketConnection()) {
      // Определяем получателя уведомления (createdById)
      const recipientId = updatedNotification.createdById;
      if (recipientId) {
        console.log(`Отправка обновления уведомления пользователю ${recipientId}`);
        socket.emit('notification', {
          userId: recipientId,
          notification: updatedNotification,
        });
      }
    }

    return updatedNotification;
  } catch (error) {
    console.error('Ошибка при отметке уведомления как прочитанное:', error);
    throw error;
  }
}

/**
 * Отмечает все непрочитанные уведомления пользователя как прочитанные
 * @param userId Идентификатор пользователя
 * @returns Количество обновленных уведомлений
 */
export async function markAllUserNotificationsAsRead(userId: string) {
  try {
    // Определяем, является ли пользователь водителем или клиентом
    const user = await prisma.user.findUnique({
      where: { uuid: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Условие для обновления в зависимости от роли пользователя
    const whereCondition =
      user.role === 'Driver'
        ? { driverId: userId, read: false }
        : { clientId: userId, read: false };

    // Обновляем все непрочитанные уведомления пользователя
    const result = await prisma.notification.updateMany({
      where: whereCondition,
      data: { read: true },
    });

    return {
      success: true,
      count: result.count,
      message: `${result.count} уведомлений отмечено как прочитанные`,
    };
  } catch (error) {
    console.error('Ошибка при массовой отметке уведомлений:', error);
    throw error;
  }
}
