//src/components/PreOrderNotificationModal.tsx
import React from 'react';
import { DriverNotification } from '@features/orders/driver-notifications/hooks/useModalManager';

interface PreOrderNotificationModalProps {
  notification: DriverNotification;
  closeModal: () => void;

  onTheWay: (notificationId: string) => Promise<void>;
  arrived: (notificationId: string) => Promise<void>;
  pickedUp: (notificationId: string) => Promise<void>;
  completed: (notificationId: string) => Promise<void>;
}

export const PreOrderNotificationModal: React.FC<PreOrderNotificationModalProps> = ({
  notification,
  closeModal,
  onTheWay,
  arrived,
  pickedUp,
  completed,
}) => {
  return (
    <div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
      <button onClick={() => onTheWay(notification.uuid)}>В пути</button>
      <button onClick={() => arrived(notification.uuid)}>Прибыл</button>
      <button onClick={() => pickedUp(notification.uuid)}>Забрал</button>
      <button onClick={() => completed(notification.uuid)}>Завершил</button>
    </div>
  );
};
