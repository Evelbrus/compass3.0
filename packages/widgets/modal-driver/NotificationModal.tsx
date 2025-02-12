import React, { useCallback } from 'react';
import { DriverAcceptanceStatus } from '@prisma/client';
import { DriverNotification } from '@features/orders/driver-notifications/hooks/useModalManager';

interface NotificationModalProps {
  notification: DriverNotification;
  closeModal: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  acceptOrder: (notificationId: string, orderId: string) => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  closeModal,
  markAsRead,
}) => {
  const handleAccept = useCallback(async () => {
    try {
      await markAsRead(notification.uuid);
      closeModal();
    } catch (error: any) {
      console.error('Ошибка при пометке уведомления как принятое:', error);
      alert(error.message || 'Не удалось пометить уведомление как принятое');
    }
  }, [notification.uuid, markAsRead, closeModal]);

  const handleReject = useCallback(async () => {
    try {
      await markAsRead(notification.uuid);

      closeModal();
    } catch (error: any) {
      console.error('Ошибка при пометке уведомления как отклоненное:', error);
      alert(error.message || 'Не удалось пометить уведомление как отклоненное');
    }
  }, [notification.uuid, closeModal, markAsRead]);

  return (
    <div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
      <button onClick={handleAccept}>Принять</button>
      <button onClick={handleReject}>Отклонить</button>
    </div>
  );
};
