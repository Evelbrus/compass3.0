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
        console.log('📩 Получено уведомление через сокет:', notification);
        setNotifications((prev) => {
          const existingIndex = prev.findIndex((n) => n.uuid === notification.uuid);
          const updatedNotifications = [...prev];

          if (existingIndex !== -1) {
            console.log(`Обновляем уведомление ${notification.uuid}, read: ${notification.read}`);
            updatedNotifications[existingIndex] = notification;
          } else {
            console.log(`Добавляем новое уведомление ${notification.uuid}, read: ${notification.read}`);
            updatedNotifications.unshift(notification);
          }

          console.log(`Текущая роль userSession: ${userSession?.role}, userId: ${userSession?.uuid}`);
          console.log(`Проверка для админа/оператора: action=${notification.action}, read=${notification.read}`);
          if (
            !notification.read &&
            (notification.action === NOTIFICATION_TYPES.NOTED ||
              notification.action === NOTIFICATION_TYPES.IN_PROGRESS ||
              notification.action === NOTIFICATION_TYPES.WARNING)
          ) {
            console.log(`Открываем модалку для уведомления ${notification.uuid}`);
            openModal(notification);
          } else {
            console.log(`Модалка не открывается: read=${notification.read}, action=${notification.action}`);
          }

          return updatedNotifications;
        });
      }, 300),
      [openModal, userSession],
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
          (n) => n.action !== NOTIFICATION_TYPES.NOTED && n.action !== NOTIFICATION_TYPES.IN_PROGRESS,
        );

        if (notificationsToDelete.length === 0) {
          console.log('ℹ️ Нет уведомлений для удаления (исключены noted и inProgress)');
          setIsLoading(false);
          return;
        }

        await bulkDeleteNotifications(notificationsToDelete.map((n) => n.uuid));
        setNotifications((prev) =>
          prev.filter(
            (n) =>
              n.action === NOTIFICATION_TYPES.NOTED || n.action === NOTIFICATION_TYPES.IN_PROGRESS,
          ),
        );

        if (
          activeNotification &&
          notificationsToDelete.some((n) => n.uuid === activeNotification.uuid)
        ) {
          closeModal();
        }
      } catch (err) {
        console.error('Ошибка при очистке уведомлений:', err);
        setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
      } finally {
        setIsLoading(false);
      }
    }, [notifications, activeNotification, closeModal]);

    const markAsRead = useCallback(async (notificationId: string) => {
      try {
        await markNotificationAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.uuid === notificationId ? { ...n, read: true } : n)),
        );
      } catch (err) {
        console.error('Ошибка при пометке как прочитанного:', err);
        setError(err instanceof Error ? err.message : 'Не удалось пометить как прочитанное');
      }
    }, []);

    console.log('userSession ', userSession )

    useEffect(() => {
      const loadNotifications = async () => {
        if (!userSession) {
          console.log('Нет userSession, уведомления не загружаются');
          return;
        }
        setIsLoading(true);
        setError(null);
        try {
          console.log(`Загружаем уведомления для userId: ${userSession.uuid}, role: ${userSession.role}`);
          const data = await fetchNotifications(userSession.uuid);
          console.log('Полученные уведомления:', data);
          setNotifications(data);
          const unreadNotification = data.find(
            (n) =>
              !n.read &&
              (n.action === NOTIFICATION_TYPES.NOTED ||
                n.action === NOTIFICATION_TYPES.IN_PROGRESS ||
                n.action === NOTIFICATION_TYPES.WARNING),
          );
          if (unreadNotification) {
            console.log(`Найдено непрочитанное уведомление:`, unreadNotification);
            openModal(unreadNotification);
          } else {
            console.log('Непрочитанных уведомлений для открытия модалки нет');
          }
        } catch (err) {
          console.error('Ошибка при загрузке уведомлений:', err);
          setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления');
          setNotifications([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadNotifications();

      if (!socket) {
        console.error('Сокет не инициализирован');
        return;
      }

      if (!userSession) {
        console.log('Нет userSession, регистрация не выполняется');
        return;
      }

      socket.on('connect', () => {
        console.log('Фронтенд подключен к WebSocket-серверу:', socket.id);
        socket.emit('register', { userId: userSession.uuid, role: userSession.role });
        console.log(`Клиент зарегистрирован: userId: ${userSession.uuid}, role: ${userSession.role}`);
      });

      socket.on('connect_error', (error) => {
        console.error('Ошибка подключения к WebSocket-серверу:', error.message);
      });

      socket.on('disconnect', () => {
        console.log('Фронтенд отключен от WebSocket-сервера');
      });

      if (socket.connected) {
        socket.emit('register', { userId: userSession.uuid, role: userSession.role });
        console.log(`Клиент зарегистрирован (немедленно): userId: ${userSession.uuid}, role: ${userSession.role}`);
      }

      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
      };
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
