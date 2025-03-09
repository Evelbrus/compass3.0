import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { UserSession } from '@shared/prisma/interface/users/interface';
import {
  Action,
  AdditionalService,
  DriverAcceptanceStatus,
  type Notification as PrismaNotification,
  OrderStatus,
  TariffOnService,
  UserRole,
} from '@prisma/client';
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
} from '@shared/lib/effector/state/state';

export const stages: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидание принятия заказа',
  TAKEN: 'Водитель уведомлен о заказе',
  ACCEPTED: 'Заказ принят водителем',
  ON_THE_WAY: 'Еду к клиенту',
  ARRIVED: 'Прибыл к клиенту',
  PICKED_UP: 'Клиент в машине, поездка начата',
  COMPLETED: 'Поездка завершена',
  TIMEOUT: 'Время ожидания истекло',
};

export interface OrderDetail {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  createdBy: { fullName: string; phone: string };
  tariff: { name: string; price: number };
  departureTime: string;
  description: string | null;
  additionalServices?: (TariffOnService & AdditionalService)[];
  driverAcceptanceStatus?: DriverAcceptanceStatus;
  status: OrderStatus;
  assignedDriverId?: string;
  basePrice?: string | number;
}

export interface NotificationIslandProps {
  userSession?: UserSession | null;
}

export const useNotifications = ({ userSession }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<PrismaNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotificationReceived, setNewNotificationReceived] = useState(false);

  const openModal = useCallback(
    (notification: PrismaNotification) => {
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
      setActiveNotification(notification); // Теперь тип PrismaNotification совпадает
    },
    [userSession],
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setActiveNotification(null);
  }, []);

  const handleNotification = useCallback((notification: PrismaNotification) => {
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

      setNewNotificationReceived(true);
      return updatedNotifications;
    });
  }, []);

  // Отдельный useEffect для открытия модального окна при получении нового уведомления
  useEffect(() => {
    const newestNotification = notifications[0];
    if (newestNotification && newNotificationReceived) {
      if (!(newestNotification.action === Action.noted && newestNotification.read)) {
        openModal(newestNotification);
      }
      setNewNotificationReceived(false);
    }
  }, [notifications, newNotificationReceived, openModal]);

  const debouncedHandleNotification = useCallback(debounce(handleNotification, 300), [
    handleNotification,
  ]);

  const socket = useSocket<PrismaNotification>('notification', debouncedHandleNotification);

  const getDriverNotifications = useCallback(
    (driverId: string) => {
      return notifications.filter((n) => n.userId === driverId);
    },
    [notifications],
  );

  const getClientNotifications = useCallback(
    (clientId: string) => {
      return notifications.filter((n) => n.userId === clientId);
    },
    [notifications],
  );

  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const notificationsToDelete = notifications.filter((n) => n.action === Action.info);
      if (notificationsToDelete.length === 0) {
        console.log('ℹ️ Нет уведомлений с action: "info" для удаления');
        setIsLoading(false);
        return;
      }

      await bulkDeleteNotifications(notificationsToDelete.map((n) => n.uuid));
      setNotifications((prev) => prev.filter((n) => n.action !== Action.info));
    } catch (err) {
      console.error('Ошибка при очистке уведомлений:', err);
      setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

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

  // Загрузка уведомлений
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
        setNotifications(data);
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

  // Отдельный useEffect для открытия модальных окон при загрузке уведомлений
  useEffect(() => {
    if (notifications.length > 0 && !isLoading) {
      const unreadNotification = notifications.find(
        (n) =>
          !n.read &&
          (n.action === Action.noted ||
            n.action === Action.inProgress ||
            n.action === Action.warning ||
            n.action === Action.cancelled),
      );

      if (unreadNotification) {
        openModal(unreadNotification);
      }
    }
  }, [notifications, isLoading, openModal]);

  useEffect(() => {
    if (newNotificationReceived) {
      console.log('Триггерим обновление заказов при новом уведомлении');
      triggerUpdate();
    }
  }, [newNotificationReceived]);

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

  console.log('notifications', notifications);

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
