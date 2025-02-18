import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { Action } from '@prisma/client';
import { openModal, setDriverOrderUuid, addWarningNotification } from '@shared/lib/effector';

//Интерфейс уведомления (при необходимости можно переиспользовать его из effector или вынести в отдельный файл)
export interface Notification {
  uuid: string;
  orderId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action: Action;
}

export interface NotificationIslandProps {
  userSession?: UserSession | null;
}

export const useNotifications = ({ userSession }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Обработчик уведомлений, приходящих через вебсокет
  const handleNotification = useCallback((notification: Notification) => {
    console.log('Получено уведомление через вебсокет:', notification);
    setNotifications((prev) => [notification, ...prev]);

    //Открываем модалку только если уведомление не прочитано (read === false)
    if (!notification.read) {
      if (notification.action === Action.noted) {
        setDriverOrderUuid(notification.orderId);
        openModal('orderInfoModal');
      } else if (notification.action === Action.inProgress) {
        setDriverOrderUuid(notification.orderId);
        openModal('orderProgressModal');
      } else if (notification.action === Action.warning) {
        //Если уведомление со статусом warning — сохраняем его в отдельное хранилище
        addWarningNotification(notification);
      }
    }
  }, []);

  const socket = useSocket('notification', handleNotification);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userSession) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/notifications?userId=${userSession.uuid}`);
        if (!response.ok) {
          throw new Error(`Не удалось получить уведомления: ${response.statusText}`);
        }
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Ошибка при получении уведомлений:', err);
        setError(err instanceof Error ? err.message : 'Не удалось получить уведомления');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    if (socket && userSession) {
      const registerUser = () => {
        socket.emit('register', { userId: userSession.uuid, role: userSession.role });
      };

      if (socket.connected) {
        registerUser();
      } else {
        socket.on('connect', registerUser);
      }

      return () => {
        socket.off('connect', registerUser);
        socket.off('notification');
      };
    }
  }, [userSession, socket]);

  //Дополнительный эффект: при загрузке уведомлений проверяем,
  //если среди них есть непрочитанное уведомление с нужным статусом, открываем модалку.
  useEffect(() => {
    if (notifications.length > 0) {
      //Выбираем первое уведомление с нужным статусом и не прочитанное
      const targetNotification = notifications.find(
        (n) => !n.read && (n.action === Action.noted || n.action === Action.inProgress),
      );
      if (targetNotification) {
        console.log('Найдено уведомление с нужным статусом:', targetNotification);
        setDriverOrderUuid(targetNotification.orderId);
        if (targetNotification.action === Action.noted) {
          openModal('orderInfoModal');
        } else if (targetNotification.action === Action.inProgress) {
          openModal('orderProgressModal');
        }
      }
    }
  }, [notifications]);

  //Функция для очистки уведомлений
  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(
        notifications.map(async (notification) => {
          const response = await fetch(`/api/notifications/${notification.uuid}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(
              `Не удалось удалить уведомление ${notification.uuid}: ${response.statusText}`,
            );
          }
        }),
      );
      setNotifications([]);
    } catch (err) {
      console.error('Ошибка при очистке уведомлений:', err);
      setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  //Функция для пометки уведомления как прочитанного
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!response.ok) {
        throw new Error(`Не удалось пометить уведомление как прочитанное: ${response.statusText}`);
      }
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.uuid === notificationId ? { ...notification, read: true } : notification,
        ),
      );
    } catch (err) {
      console.error('Ошибка при пометке уведомления как прочитанного:', err);
      setError(
        err instanceof Error ? err.message : 'Не удалось пометить уведомление как прочитанное',
      );
    }
  }, []);

  //Функция для удаления уведомления
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Не удалось удалить уведомление: ${response.statusText}`);
      }
      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err) {
      console.error('Ошибка при удалении уведомления:', err);
      setError(err instanceof Error ? err.message : 'Не удалось удалить уведомление');
    }
  }, []);

  return { notifications, clearNotifications, isLoading, error, markAsRead, deleteNotification };
};

export default useNotifications;
