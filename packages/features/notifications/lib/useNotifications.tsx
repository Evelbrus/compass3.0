import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { UserRole, OrderStatus, Notification } from '@prisma/client';
import {
  bulkDeleteNotifications,
  fetchNotifications,
  markNotificationAsRead,
} from '@features/notifications/api/apiNotifications';
import { debounce } from '@shared/utils/hooks/useDebounce';
import {
  triggerUpdate,
  setModalType,
  setActiveNotification,
  ModalType,
  $activeNotification,
} from '@shared/lib/effector/state/state';
import {
  driverAcceptanceStatusLabels,
  getOrderStatusLabel,
} from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';

// Расширенный тип уведомления, включающий данные заказа
export type ExtendedNotification = Notification & {
  order?: {
    status: OrderStatus;
    driverAcceptanceStatus: string | null;
  } | null;
};

/**
 * Получает статус заказа из уведомления
 */
export const getOrderStatusFromNotification = (notification: ExtendedNotification): OrderStatus => {
  // Если есть данные заказа, используем статус из заказа
  if (notification.order && notification.order.status) {
    return notification.order.status;
  }
  // По умолчанию возвращаем PENDING
  return OrderStatus.PENDING;
};

export const stages = driverAcceptanceStatusLabels;

// Функция для определения важных уведомлений
const isImportantNotification = (status: OrderStatus): boolean => {
  return status === OrderStatus.CANCELLED || status === OrderStatus.COMPLETED;
};

// Функция для определения уведомлений, требующих внимания в зависимости от роли
const shouldShowModalForRole = (
  notification: ExtendedNotification,
  userRole: UserRole | undefined,
): boolean => {
  if (notification.read) return false;

  const status = getOrderStatusFromNotification(notification);

  switch (userRole) {
    case UserRole.Driver:
      // Для водителя показываем модалки только при новом назначении, отмене или завершении
      return (
        status === OrderStatus.CANCELLED ||
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.PENDING ||
        status === OrderStatus.PLANNED
      );

    case UserRole.Admin:
    case UserRole.Operator:
      // Для админа/оператора показываем только при критичных статусах
      return status === OrderStatus.CANCELLED || status === OrderStatus.OVERDUE;

    case UserRole.ClientCorp:
      // Для клиента скрываем OVERDUE, показываем только важные статусы и новые заказы
      return (
        status === OrderStatus.CANCELLED ||
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.PENDING ||
        status === OrderStatus.PLANNED
      );

    default:
      return false;
  }
};

export interface NotificationIslandProps {
  userSession?: UserSession | null;
}

export const useNotifications = ({ userSession }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotificationReceived, setNewNotificationReceived] = useState(false);

  const openModal = useCallback(
    (notification: ExtendedNotification) => {
      let modalType: ModalType;
      switch (userSession?.role) {
        case UserRole.Driver:
          modalType = 'orderDriverModal';
          break;
        case UserRole.ClientCorp:
          modalType = 'orderTrackingModal';
          break;
        case UserRole.Admin:
        case UserRole.Operator:
          modalType = 'orderAdminModal';
          break;
        default:
          return;
      }
      setModalType(modalType);
      setActiveNotification(notification);
      console.log('Установлено активное уведомление:', notification);
    },
    [userSession],
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setActiveNotification(null);
  }, []);

  const handleNotification = useCallback(
    (notification: ExtendedNotification) => {
      console.log('📩 Получено уведомление через сокет:', notification);

      const status = getOrderStatusFromNotification(notification);
      const important = isImportantNotification(status);

      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n.uuid === notification.uuid);
        const updatedNotifications = [...prev];

        if (existingIndex !== -1) {
          console.log(`Обновляем уведомление ${notification.uuid}, read: ${notification.read}`);
          updatedNotifications[existingIndex] = notification;
        } else {
          console.log(
            `Добавляем новое уведомление ${notification.uuid}, read: ${notification.read}`,
          );
          updatedNotifications.unshift(notification);

          // Проверяем, нужно ли показывать модалку для данной роли
          if (shouldShowModalForRole(notification, userSession?.role)) {
            setNewNotificationReceived(true);
          }
        }

        if (important) {
          setTimeout(() => {
            const currentActiveNotification = $activeNotification.getState();
            if (
              currentActiveNotification &&
              currentActiveNotification.orderId === notification.orderId
            ) {
              console.log(
                `Обновляем активное уведомление при получении ${getOrderStatusLabel(status)}:`,
                notification,
              );
              setActiveNotification(notification);
              triggerUpdate();
            }
          }, 0);
        }

        return updatedNotifications;
      });
    },
    [userSession],
  );

  useEffect(() => {
    const newestNotification = notifications[0];
    if (newestNotification && newNotificationReceived) {
      if (
        !newestNotification.read &&
        shouldShowModalForRole(newestNotification, userSession?.role)
      ) {
        openModal(newestNotification);
      }
      setNewNotificationReceived(false);
      console.log('Триггерим обновление заказов при новом уведомлении');
      triggerUpdate();
    }
  }, [notifications, newNotificationReceived, openModal, userSession?.role]);

  const debouncedHandleNotification = useCallback(debounce(handleNotification, 300), [
    handleNotification,
  ]);

  const socket = useSocket<ExtendedNotification>('notification', debouncedHandleNotification);

  const getDriverNotifications = useCallback(
    (driverId: string) => {
      return notifications.filter((n) => n.driverById === driverId);
    },
    [notifications],
  );

  const getClientNotifications = useCallback(
    (clientId: string) => {
      return notifications.filter((n) => n.clientById === clientId);
    },
    [notifications],
  );

  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const notificationsToDelete = notifications.filter((n) => {
        const status = getOrderStatusFromNotification(n);
        return status === OrderStatus.PENDING;
      });

      if (notificationsToDelete.length === 0) {
        console.log('ℹ️ Нет информационных уведомлений для удаления');
        setIsLoading(false);
        return;
      }

      await bulkDeleteNotifications(notificationsToDelete.map((n) => n.uuid));

      setNotifications((prev) =>
        prev.filter((n) => {
          const status = getOrderStatusFromNotification(n);
          return status !== OrderStatus.PENDING;
        }),
      );
    } catch (err) {
      console.error('Ошибка при очистке уведомлений:', err);
      setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Используем обновленную функцию из нашего сервиса
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.uuid === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error('Ошибка при пометке как прочитанного:', err);
      setError(err instanceof Error ? err.message : 'Не удалось пометить как прочитанное');
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userSession) {
        console.log('Нет userSession, уведомления не загружаются');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications(userSession.uuid);
        setNotifications(data as ExtendedNotification[]);
      } catch (err) {
        console.error('Ошибка при загрузке уведомлений:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    if (!socket || !userSession) {
      console.log('Нет socket или userSession, регистрация не выполняется');
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
    }

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [userSession, socket]);

  useEffect(() => {
    if (notifications.length > 0 && !isLoading) {
      const unreadNotification = notifications.find(
        (n) => !n.read && shouldShowModalForRole(n, userSession?.role),
      );

      if (unreadNotification) {
        openModal(unreadNotification);
      }
    }
  }, [notifications, isLoading, openModal, userSession?.role]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const driverNotifications = useMemo(
    () => (userSession?.role === UserRole.Driver ? getDriverNotifications(userSession.uuid) : []),
    [notifications, userSession, getDriverNotifications],
  );

  const driverUnreadCount = useMemo(
    () => driverNotifications.filter((n) => !n.read).length,
    [driverNotifications],
  );

  const clientNotifications = useMemo(
    () =>
      userSession?.role === UserRole.ClientCorp ? getClientNotifications(userSession.uuid) : [],
    [notifications, userSession, getClientNotifications],
  );

  const clientUnreadCount = useMemo(
    () => clientNotifications.filter((n) => !n.read).length,
    [clientNotifications],
  );

  return {
    notifications,
    getDriverNotifications,
    getClientNotifications,
    unreadCount,
    driverNotifications,
    driverUnreadCount,
    clientNotifications,
    clientUnreadCount,
    isLoading,
    error,
    openModal,
    closeModal,
    clearNotifications,
    markAsRead,
  };
};
