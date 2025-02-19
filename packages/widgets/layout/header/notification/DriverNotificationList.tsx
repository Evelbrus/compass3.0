import React, { useCallback } from 'react';
import { Notification } from '@features/notifications/lib/useNotifications';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { Action } from '@prisma/client';

interface DriverNotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  openModal: (action: Action) => void;
}

const DriverNotificationList: React.FC<DriverNotificationListProps> = ({
  notifications,
  onClose,
  openModal,
}) => {
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      console.log('🟢 Нажатие на уведомление:', notification);
      if (!notification.orderId) {
        console.error('❌ Ошибка: orderId отсутствует в уведомлении');
        return;
      }
      openModal(notification.action);
      onClose();
    },
    [openModal, onClose],
  );

  return (
    <div className="absolute w-[400px] h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 rounded-md shadow-lg overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Уведомления</h1>
        <IButton variant="close" onClick={onClose} aria-label="Закрыть">
          <CloseIcon />
        </IButton>
      </div>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification.uuid}
            className="cursor-pointer p-2"
            onClick={() => handleNotificationClick(notification)}
          >
            <p>{notification.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DriverNotificationList;
