import { Notification } from '@prisma/client';

// Предполагаю, что checkAndHandleRedirect импортируется откуда-то, например:
import { checkAndHandleRedirect } from '@shared/api';

/**
 * Получение уведомлений пользователя
 * @param userId - ID пользователя
 * @returns Promise<Notification[]>
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await fetch(`/api/notifications?userId=${userId}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      return []; // Возвращаем пустой массив после редиректа, чтобы типы сошлись
    }
    throw new Error(`Ошибка загрузки уведомлений: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Пометка уведомления как прочитанного
 * @param notificationId - UUID уведомления
 * @returns Promise<void>
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: true }),
  });
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      return; // Редирект обработан, выходим
    }
    throw new Error(`Не удалось пометить уведомление как прочитанное: ${response.statusText}`);
  }
};
