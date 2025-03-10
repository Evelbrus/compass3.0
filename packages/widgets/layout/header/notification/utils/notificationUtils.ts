import { OrderStatus } from '@prisma/client';
import { ExtendedNotification, getOrderStatusFromNotification } from '@features/notifications/lib/useNotifications';
/**
 * Форматирует дату уведомления в удобном для чтения формате
 */
export const formatNotificationDate = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return 'Сегодня';
  } else if (isYesterday) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      timeZone: 'Asia/Bishkek',
    });
  }
};

/**
 * Определяет текст кнопки в зависимости от статуса заказа
 */
export const getButtonText = (notification: ExtendedNotification): string => {
  const status = getOrderStatusFromNotification(notification);

  if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
    return 'Детали';
  }

  return 'Перейти';
};

/**
 * Безопасно группирует уведомления по датам
 */
export interface NotificationGroup {
  date: Date;
  notifications: ExtendedNotification[];
  hasUnread: boolean;
}

export const groupNotificationsByDate = (
  notifications: ExtendedNotification[],
): {
  groupedNotifications: Record<string, NotificationGroup>;
  sortedDates: string[];
} => {
  // Группировка уведомлений по датам
  const groupedNotifications = notifications.reduce<Record<string, NotificationGroup>>(
    (groups, notification) => {
      // Преобразуем дату в ISO формат YYYY-MM-DD и используем его как ключ
      const dateObj = new Date(notification.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0]; // Получаем только часть с датой

      // Создаем группу для этой даты, если ее еще нет
      const group = groups[dateKey as string] || {
        date: dateObj,
        notifications: [],
        hasUnread: false,
      };

      // Добавляем уведомление в группу
      group.notifications.push(notification);

      // Проверяем, есть ли непрочитанные уведомления в группе
      if (!notification.read) {
        group.hasUnread = true;
      }

      // Обновляем запись в аккумуляторе
      groups[dateKey as string] = group;

      return groups;
    },
    {} as Record<string, NotificationGroup>,
  );

  // Получаем отсортированные ключи (ISO даты)
  const sortedDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return { groupedNotifications, sortedDates };
};
