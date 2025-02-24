import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { UserSession } from '@shared/prisma/interface/users/interface';
import {
  Action,
  AdditionalService,
  DriverAcceptanceStatus,
  Notification,
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
import { triggerUpdate } from '@shared/lib/effector/state/state';

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
}

type ModalAction = Omit<Action, 'info'>;

export interface NotificationIslandProps {
  userSession?: UserSession | null;
}

export const useNotifications = ({ userSession }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [newNotificationReceived, setNewNotificationReceived] = useState(false); // Флаг для нового уведомления

  const openModal = useCallback((notification: Notification) => {
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
          console.log(
            `Добавляем новое уведомление ${notification.uuid}, read: ${notification.read}`,
          );
          updatedNotifications.unshift(notification);
        }

        console.log(`Текущая роль userSession: ${userSession?.role}, userId: ${userSession?.uuid}`);
        console.log(
          `Проверка для админа/оператора: action=${notification.action}, read=${notification.read}`,
        );

        console.log(`Открываем модалку для уведомления ${notification.uuid}`);
        openModal(notification);

        setNewNotificationReceived(true); // Устанавливаем флаг, что пришло новое уведомление

        return updatedNotifications;
      });
    }, 300),
    [openModal, userSession],
  );

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

  const socket = useSocket('notification', handleNotification);

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
        const unreadNotification = data.find(
          (n) =>
            !n.read &&
            (n.action === Action.noted ||
              n.action === Action.inProgress ||
              n.action === Action.warning ||
              n.action === Action.cancelled),
        );
        if (unreadNotification) {
          openModal(unreadNotification);
        } else {
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
      // console.error('Сокет не инициализирован');
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
    }

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [userSession, socket, openModal]);

  // Триггер обновления только при новом уведомлении через сокет
  useEffect(() => {
    if (newNotificationReceived) {
      console.log('Триггерим обновление заказов при новом уведомлении');
      triggerUpdate();
      setNewNotificationReceived(false); // Сбрасываем флаг после триггера
    }
  }, [newNotificationReceived]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const driverNotifications = useMemo(
    () => (userSession?.role === UserRole.Driver ? getDriverNotifications(userSession.uuid) : []),
    [notifications, userSession],
  );
  const driverUnreadCount = useMemo(
    () => driverNotifications.filter((n) => !n.read).length,
    [driverNotifications],
  );

  const clientNotifications = useMemo(
    () =>
      userSession?.role === UserRole.ClientCorp ? getClientNotifications(userSession.uuid) : [],
    [notifications, userSession],
  );
  const clientUnreadCount = useMemo(
    () => clientNotifications.filter((n) => !n.read).length,
    [clientNotifications],
  );

  const shouldShowModal = useMemo(() => {
    if (!activeNotification || !userSession) return false;

    const validActions: ModalAction[] = [
      Action.noted,
      Action.inProgress,
      Action.warning,
      Action.success,
      Action.cancelled,
    ];

    if (userSession.role === UserRole.Driver || userSession.role === UserRole.ClientCorp) {
      return validActions.includes(activeNotification.action as ModalAction);
    }

    if (userSession.role === UserRole.Admin || userSession.role === UserRole.Operator) {
      return (
        activeNotification.action === Action.warning ||
        activeNotification.action === Action.cancelled
      );
    }

    return false;
  }, [activeNotification, userSession]);

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
    activeNotification,
    openModal,
    closeModal,
    clearNotifications,
    markAsRead,
    shouldShowModal,
  };
};

export default useNotifications;
