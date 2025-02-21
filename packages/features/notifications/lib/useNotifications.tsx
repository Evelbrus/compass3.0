import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { Action, Notification } from '@prisma/client';
import {
  bulkDeleteNotifications,
  fetchNotifications,
  markNotificationAsRead,
} from '@features/notifications/api/apiNotifications';
import { debounce } from '@shared/utils/hooks/useDebounce';

//Константы для типов уведомлений
const NOTIFICATION_TYPES = {
  NOTED: Action.noted,
  IN_PROGRESS: Action.inProgress,
  WARNING: Action.warning,
  SUCCESS: Action.success,
  CANCELLED: Action.cancelled,
  INFO: Action.info,
} as const;

export interface NotificationIslandProps {
  userSession?: UserSession | null;
}

export const useNotifications = ({ userSession }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const openModal = useCallback((notification: Notification) => {
    console.log(
      `Открытие модалки для уведомления ${notification.uuid} с action: ${notification.action}`,
    );
    setActiveNotification(notification);
  }, []);

  const closeModal = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const handleNotification = useCallback(
    debounce((notification: Notification) => {
      console.log('📩 Получено обновление уведомления через сокет:', notification);
      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n.uuid === notification.uuid);
        if (existingIndex !== -1) {
          console.log(
            'Обновляем существующее уведомление:',
            notification.uuid,
            'read:',
            notification.read,
          );
          const updatedNotifications = [...prev];
          updatedNotifications[existingIndex] = notification;
          if (!notification.read) {
            openModal(notification);
          }
          return updatedNotifications;
        }
        console.log('Добавляем новое уведомление:', notification.uuid, 'read:', notification.read);
        if (!notification.read) {
          openModal(notification);
        }
        return [notification, ...prev];
      });
    }, 300),
    [openModal],
  );

  const getDriverNotifications = useCallback(
    (driverId: string) => {
      return notifications.filter(
        (n) =>
          n.userId === driverId &&
          (n.action === NOTIFICATION_TYPES.NOTED ||
            n.action === NOTIFICATION_TYPES.IN_PROGRESS ||
            n.action === NOTIFICATION_TYPES.WARNING ||
            n.action === NOTIFICATION_TYPES.CANCELLED),
      );
    },
    [notifications],
  );

  const getClientNotifications = useCallback(
    (clientId: string) => {
      console.log('clientId', clientId);
      return notifications.filter(
        (n) => n.createdById === clientId && n.action === NOTIFICATION_TYPES.IN_PROGRESS,
      );
    },
    [notifications],
  );

  const socket = useSocket('notification', handleNotification);

  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const notificationsToDelete = notifications.filter(
        (notification) =>
          notification.action !== NOTIFICATION_TYPES.NOTED &&
          notification.action !== NOTIFICATION_TYPES.IN_PROGRESS,
      );

      if (notificationsToDelete.length === 0) {
        console.log('ℹ️ Нет уведомлений для удаления (исключены noted и inProgress)');
        setIsLoading(false);
        return;
      }

      await bulkDeleteNotifications(notificationsToDelete.map((n) => n.uuid));
      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification.action === NOTIFICATION_TYPES.NOTED ||
            notification.action === NOTIFICATION_TYPES.IN_PROGRESS,
        ),
      );

      if (
        activeNotification &&
        !notificationsToDelete.some((n) => n.uuid === activeNotification.uuid)
      ) {
        setActiveNotification(null);
      }
    } catch (err) {
      console.error('Ошибка при очистке уведомлений:', err);
      setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
    } finally {
      setIsLoading(false);
    }
  }, [notifications, activeNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
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

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userSession) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications(userSession.uuid);
        setNotifications(data);
        const unreadNotification = data.find((n) => !n.read);
        if (unreadNotification) {
          openModal(unreadNotification);
        }
      } catch (err) {
        console.error('Ошибка при получении уведомлений:', err);
        setError(err instanceof Error ? err.message : 'Не удалось получить уведомления');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    if (socket && userSession) {
      socket.emit('register', { userId: userSession.uuid, role: userSession.role });
      console.log(
        `Клиент зарегистрирован с userId: ${userSession.uuid}, role: ${userSession.role}`,
      );
    }
  }, [userSession, socket, openModal]);

  return {
    notifications,
    getDriverNotifications,
    getClientNotifications,
    isLoading,
    error,
    activeNotification,
    openModal,
    closeModal,
    clearNotifications,
    markAsRead,
  };
};

export default useNotifications;
