import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';

export interface Notification {
  uuid: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Функция, обрабатывающая уведомления, полученные через сокет
  const handleNotification = useCallback((notification: Notification) => {
    console.log('Получено уведомление через сокет:', notification); //Логирование объекта
    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        read: false, //Предполагаем, что новые уведомления всегда непрочитаны
      },
    ]);
  }, []);

  const socket = useSocket('notification', handleNotification);

  useEffect(() => {
    //Функция для загрузки уведомлений с сервера
    const fetchNotifications = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Не удалось получить уведомления: ${response.statusText}`);
        }

        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err: any) {
        console.error('Ошибка при получении уведомлений:', err);
        setError(err.message || 'Не удалось получить уведомления');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications(); //Загружаем уведомления при монтировании компонента

    //Подключаемся к сокету, если есть ID пользователя
    if (socket && userId) {
      const registerUser = () => {
        socket.emit('register', userId);
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
  }, [userId, socket]);

  //Функция для очистки уведомлений
  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      //Отправляем запросы DELETE для *каждого* уведомления
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

      //После успешного удаления всех уведомлений, очищаем локальное состояние
      setNotifications([]);
    } catch (err: any) {
      console.error('Ошибка при очистке уведомлений:', err);
      setError(err.message || 'Не удалось очистить уведомления');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]); //Важно: notifications в зависимостях

  //Функция для пометки уведомления как прочитанного
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось пометить уведомление как прочитанное: ${response.statusText}`);
      }

      //Обновляем уведомление в локальном состоянии
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.uuid === notificationId ? { ...notification, read: true } : notification,
        ),
      );
    } catch (err: any) {
      console.error('Ошибка при пометке уведомления как прочитанного:', err);
      setError(err.message || 'Не удалось пометить уведомление как прочитанное');
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

      //Удаляем уведомление из локального состояния
      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при удалении уведомления:', err);
      setError(err.message || 'Не удалось удалить уведомление');
    }
  }, []);

  return { notifications, clearNotifications, isLoading, error, markAsRead, deleteNotification };
};
