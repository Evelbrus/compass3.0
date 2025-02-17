import { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { DriverAcceptanceStatus } from '@prisma/client';
import {
  DriverNotification,
  useModalManager,
} from '@features/orders/driver-notifications/hooks/useModalManager';
import { usePreOrderModalManager } from '@features/orders/driver-notifications/hooks/usePreOrderModalManager';

export const useDriverNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userSessionDep, setUserSessionDep] = useState<string | null>(userId || null);
  const { openNotificationModal } = useModalManager();
  const [receivedNotificationIds, setReceivedNotificationIds] = useState<Set<string>>(new Set());
  const { openPreOrderNotificationModal } = usePreOrderModalManager();
  const openPreOrderNotificationModalRef = useRef(openPreOrderNotificationModal);

  useEffect(() => {
    openPreOrderNotificationModalRef.current = openPreOrderNotificationModal;
  }, [openPreOrderNotificationModal]);

  const handleDriverNotification = useCallback(
    (notification: DriverNotification) => {
      console.log('handleDriverNotification вызвана с данными:', notification);
      console.log('notification.driverId:', notification.driverId);

      if (notification.driverId === userSessionDep) {
        console.log('✅ Получено уведомление через сокет:', notification);

        setReceivedNotificationIds((prevIds) => {
          if (prevIds.has(notification.uuid)) {
            console.warn(
              '⚠️ Обнаружен дубликат уведомления, ID:',
              notification.uuid,
              ', сообщение:',
              notification,
            );
            return prevIds;
          }

          //Добавляем новый UUID в Set
          const newIds = new Set(prevIds);
          newIds.add(notification.uuid);

          //Добавляем новое уведомление в список
          setNotifications((prev) => [notification, ...prev]);

          //Теперь проверяем статус для определения, какой модалкой открывать
          switch (notification.status) {
            case DriverAcceptanceStatus.PENDING:
            case DriverAcceptanceStatus.TAKEN:
            case DriverAcceptanceStatus.ACCEPTED:
            case DriverAcceptanceStatus.REJECTED:
              openNotificationModal(notification);
              break;
            default:
              console.log('Неопознанный статус уведомления');
              break;
          }

          return newIds;
        });
      } else {
        console.log('❌ Уведомление не для этого водителя');
      }
    },
    [userSessionDep, openNotificationModal],
  );

  //Теперь socket доступен в пределах useEffect
  const socket = useSocket('driverOrderNotification', (data: DriverNotification) => {
    console.log('📡 WebSocket-сообщение (внутри useSocket):', data);
    handleDriverNotification(data);
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userSessionDep) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/driver-notifications?driverId=${userSessionDep}`);
        if (!response.ok) {
          throw new Error(`Не удалось получить уведомления: ${response.statusText}`);
        }
        const data: DriverNotification[] = await response.json();

        const initialIds = new Set(data.map((notification) => notification.uuid));
        setReceivedNotificationIds(initialIds);
        setNotifications(data);
      } catch (err: any) {
        console.error('Ошибка при получении уведомлений:', err);
        setError(err.message || 'Не удалось получить уведомления');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    if (socket && userSessionDep) {
      const registerUser = () => {
        socket.emit('register', userSessionDep);
      };

      if (!socket.connected) {
        socket.connect();
      }
      registerUser();

      socket.on('driverOrderNotification', handleDriverNotification);

      return () => {
        socket.off('driverOrderNotification', handleDriverNotification);
        setReceivedNotificationIds(new Set());
      };
    }
  }, [userSessionDep, socket, handleDriverNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isRead: true,
          status: DriverAcceptanceStatus.TAKEN,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось пометить уведомление как прочитанное: ${response.statusText}`);
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при пометке уведомления водителя как прочитанного:', err);
      setError(err.message || 'Не удалось пометить уведомление как прочитанное');
    }
  }, []);

  const acceptOrder = useCallback(async (notificationId: string, orderId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DriverAcceptanceStatus.ACCEPTED,
          orderStatus: DriverAcceptanceStatus.TAKEN,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось принять заказ: ${response.statusText}`);
      }
      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при принятии заказа:', err);
      setError(err.message || 'Не удалось принять заказ');
    }
  }, []);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    acceptOrder,
  };
};
