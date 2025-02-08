//components/ModalDriver.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@shared/utils/hooks/useSession';
import { useSocket } from '@shared/utils/hooks/useSocket';

interface NotificationData {
  uuid: string;
  orderId: string;
  driverId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ModalDriver = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const { userSession } = useSession();
  const socket = useSocket();

  const fetchUnreadNotifications = useCallback(async () => {
    if (userSession?.uuid) {
      try {
        const response = await fetch(`/api/driver-notifications?driverId=${userSession.uuid}`);
        if (response.ok) {
          const notifications: NotificationData[] = await response.json();
          //Фильтруем уведомления на фронтенде, чтобы отображать только непрочитанные
          const unreadNotifications = notifications.filter((notification) => !notification.isRead);

          if (unreadNotifications.length > 0) {
            setNotification(unreadNotifications[0]);
            setShowNotificationModal(true);
          } else {
            setNotification(null);
            setShowNotificationModal(false);
            console.log('Нет непрочитанных уведомлений');
          }
        } else {
          console.error('Ошибка при получении уведомлений');
        }
      } catch (error) {
        console.error('Ошибка при получении уведомлений:', error);
      }
    }
  }, [userSession]);

  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  useEffect(() => {
    if (socket) {
      const handleDriverOrderNotification = (notificationData: NotificationData) => {
        console.log('Получено driverOrderNotification:', notificationData); //Добавили логирование
        //При получении нового уведомления о заказе, сбрасываем текущее и показываем новое
        setNotification(notificationData);
        setShowNotificationModal(true);
      };

      console.log('ModalDriver: Подписываемся на driverOrderNotification'); //Добавлено логирование
      socket.on('driverOrderNotification', handleDriverOrderNotification); //Прослушиваем ТОЛЬКО driverOrderNotification

      return () => {
        console.log('ModalDriver: Отписываемся от driverOrderNotification'); //Добавлено логирование
        socket.off('driverOrderNotification', handleDriverOrderNotification); //Отписываемся от driverOrderNotification
      };
    }
  }, [socket]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (socket) {
        console.log('ModalDriver: Сокет подключен, ждем уведомления...', socket.connected);
      } else {
        console.log('ModalDriver: Сокет не подключен');
      }
    }, 5000); //Каждые 5 секунд

    return () => clearInterval(intervalId); //Очищаем интервал при размонтировании компонента
  }, [socket]);

  const handleMarkAsRead = async () => {
    if (notification?.uuid) {
      try {
        const response = await fetch(`/api/driver-notifications/${notification.uuid}`, {
          method: 'PATCH',
        });
        if (response.ok) {
          //После успешной отметки как прочитанного, запрашиваем оставшиеся непрочитанные уведомления
          fetchUnreadNotifications();
          setShowNotificationModal(false);
          setNotification(null);
        } else {
          console.error('Ошибка при отметке уведомления как прочитанного');
        }
      } catch (error) {
        console.error('Ошибка при отметке уведомления как прочитанного:', error);
      }
    }
  };

  if (!showNotificationModal || !notification) {
    return null;
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border rounded shadow-md z-50">
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
      <button onClick={handleMarkAsRead}>OK</button>
    </div>
  );
};

export default ModalDriver;
