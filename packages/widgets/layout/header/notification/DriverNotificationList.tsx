import React, { useCallback } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { Action, Notification } from '@prisma/client';

interface DriverNotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  openModal: (notification: Notification) => void;
}

const DriverNotificationList: React.FC<DriverNotificationListProps> = ({
  notifications,
  onClose,
  openModal,
}) => {

  console.log('notifications', notifications)

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      console.log('🟢 Нажатие на уведомление:', notification);
      if (!notification.orderId) {
        console.error('❌ Ошибка: orderId отсутствует в уведомлении');
        return;
      }
      openModal(notification);
      onClose();
    },
    [openModal, onClose],
  );

  const getActionStyles = (action: Action) => {
    switch (action) {
      case Action.inProgress:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'В процессе',
        };
      case Action.warning:
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Предупреждение',
        };
      case Action.noted:
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Отмечено',
        };
      case Action.cancelled:
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          label: 'Отменено',
        };
      case Action.success:
        return {
          bgColor: 'bg-green-200',
          textColor: 'text-green-900',
          label: 'Успешно',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Неизвестно',
        };
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const order = {
      [Action.warning]: 1,
      [Action.inProgress]: 2,
      [Action.noted]: 3,
    };
    return (order[a.action] || 4) - (order[b.action] || 4);
  });

  return (
    <div className="absolute w-[400px] max-h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 rounded-md shadow-lg overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Уведомления водителя</h1>
        <IButton
          variant="close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
        >
          <CloseIcon />
        </IButton>
      </div>
      {sortedNotifications.length === 0 ? (
        <p className="text-gray-500 text-center">Уведомлений нет</p>
      ) : (
        <ul className="space-y-2">
          {sortedNotifications.map((notification) => {
            const { bgColor, textColor, label } = getActionStyles(notification.action);
            return (
              <li
                key={notification.uuid}
                className={`p-4 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-opacity-80 ${bgColor}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-lg font-semibold ${textColor}`}>{notification.title}</h2>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${textColor} ${bgColor}`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{notification.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {!notification.read && (
                    <span className="text-xs font-medium text-blue-500">Непрочитано</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DriverNotificationList;
