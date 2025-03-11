import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const log = debug('app:services:notifications');

/**
 * Получает уведомления для пользователя
 * @param userId Идентификатор пользователя
 * @param options Дополнительные параметры запроса
 * @returns Массив уведомлений или количество непрочитанных
 */
export async function getUserNotifications(
  userId: string,
  options: { countOnly?: boolean; isAdmin?: boolean } = {},
) {
  try {
    const { countOnly = false, isAdmin = false } = options;

    // Определяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { uuid: userId },
      select: { role: true },
    });

    if (!user) {
      log(`Пользователь с ID ${userId} не найден`);
      throw new Error('Пользователь не найден');
    }

    // Если запрошено только количество непрочитанных
    if (countOnly) {
      const whereCondition =
        user.role === 'Driver'
          ? { driverId: userId, read: false }
          : { clientId: userId, read: false };

      const count = await prisma.notification.count({
        where: whereCondition,
      });

      return {
        success: true,
        count: count,
      };
    }

    // Определяем условия запроса в зависимости от роли
    let whereCondition = {};

    if (isAdmin && (user.role === 'Admin' || user.role === 'Operator')) {
      // Для администраторов - уведомления, созданные ими или связанные с проблемными заказами
      whereCondition = {
        OR: [{ createdById: userId }, { order: { status: { in: ['OVERDUE', 'CANCELLED'] } } }],
      };
    } else {
      // Для обычных пользователей - уведомления, адресованные им
      whereCondition = user.role === 'Driver' ? { driverId: userId } : { clientId: userId };
    }

    // Получаем уведомления
    const notifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        order: {
          select: {
            uuid: true,
            status: true,
            driverAcceptanceStatus: true,
            departureTime: true,
            clientBy: isAdmin
              ? {
                  select: {
                    uuid: true,
                    fullName: true,
                  },
                }
              : undefined,
            assignedDriver: isAdmin
              ? {
                  select: {
                    uuid: true,
                    fullName: true,
                  },
                }
              : undefined,
            departurePoint: {
              select: {
                address: true,
              },
            },
            arrivalPoint: {
              select: {
                address: true,
              },
            },
          },
        },
      },
    });

    log(`Получено ${notifications.length} уведомлений для пользователя ${userId}`);

    return {
      success: true,
      data: notifications,
      count: notifications.length,
    };
  } catch (error) {
    log('Ошибка при получении уведомлений:', error);
    throw error;
  }
}
