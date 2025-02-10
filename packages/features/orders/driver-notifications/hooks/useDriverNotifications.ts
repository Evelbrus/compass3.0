import { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';
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
  const { openNotificationModal, openOrderModal, closeModal, modalType } = useModalManager();
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

          console.log('Новый ID, добавляем в Set:', notification.uuid);
          const newIds = new Set(prevIds);
          newIds.add(notification.uuid);

          setNotifications((prev) => {
            const newNotification = {
              ...notification,
              isRead: false,
            };
            const updatedNotifications = [newNotification, ...prev];
            console.log('Обновленный список уведомлений:', updatedNotifications);
            return updatedNotifications;
          });

          //Проверяем, что за тип уведомления и если нужно открываем другую модалку
          if (notification.type === 'preOrder') {
            openPreOrderNotificationModalRef.current(notification);
          } else {
            openNotificationModal(notification);
          }

          return newIds;
        });
      } else {
        console.log('❌ Уведомление не для этого водителя');
      }
    },
    [userSessionDep, openNotificationModal], //Удалили openPreOrderNotificationModal
  );

  useEffect(() => {
    console.log('Состояние уведомлений (внутри useEffect):', notifications);
  }, [notifications]);

  const socket = useSocket('driverOrderNotification', (data: DriverNotification) => {
    console.log('📡 WebSocket-сообщение (внутри useSocket):', data);
    handleDriverNotification(data);
  });

  useEffect(() => {
    console.log('Хук useSocket:', socket);

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
        console.log('registerUser вызвана с userId:', userSessionDep);
        socket.emit('register', userSessionDep);
      };

      if (!socket.connected) {
        console.log('Соединение с сокетом отсутствует, подключаемся...');
        socket.connect();
      }
      registerUser();

      console.log('Устанавливаем обработчик событий сокета для driverOrderNotification');
      socket.on('driverOrderNotification', handleDriverNotification);

      return () => {
        console.log('Очищаем обработчик событий сокета');
        socket.off('driverOrderNotification', handleDriverNotification);
        setReceivedNotificationIds(new Set());
      };
    }
  }, [userSessionDep, socket, handleDriverNotification]);

  useEffect(() => {
    setUserSessionDep(userId || null);
  }, [userId]);

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
          orderStatus: OrderStatus.IN_PROGRESS,
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

  const onTheWay = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DriverAcceptanceStatus.ON_THE_WAY,
          orderStatus: OrderStatus.IN_PROGRESS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось изменить статус: ${response.statusText}`);
      }
      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при изменении статуса:', err);
      setError(err.message || 'Не удалось изменить статус');
    }
  }, []);

  const arrived = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DriverAcceptanceStatus.ARRIVED,
          orderStatus: OrderStatus.IN_PROGRESS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось изменить статус: ${response.statusText}`);
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при изменении статуса:', err);
      setError(err.message || 'Не удалось изменить статус');
    }
  }, []);

  const pickedUp = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DriverAcceptanceStatus.PICKED_UP,
          orderStatus: OrderStatus.IN_PROGRESS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось изменить статус: ${response.statusText}`);
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при изменении статуса:', err);
      setError(err.message || 'Не удалось изменить статус');
    }
  }, []);

  const completed = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/driver-notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DriverAcceptanceStatus.COMPLETED,
          orderStatus: OrderStatus.COMPLETED,
        }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось изменить статус: ${response.statusText}`);
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.uuid !== notificationId),
      );
    } catch (err: any) {
      console.error('Ошибка при изменении статуса:', err);
      setError(err.message || 'Не удалось изменить статус');
    }
  }, []);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    acceptOrder,
    onTheWay,
    arrived,
    pickedUp,
    completed,
  };
};
