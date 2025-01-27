import React from 'react';
import { Notification } from '@features/notifications/lib/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onClose, onClear }) => {
  if (notifications.length === 0) {
    return (
      <div className="absolute right-0 top-10 z-50 bg-white p-4 rounded-md shadow-lg">
        <p>Нет уведомлений</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    );
  }
  return (
    <div className="absolute right-0 top-10 z-50 bg-white p-4 rounded-md shadow-lg">
      <ul className="max-h-48 overflow-y-auto">
        {notifications.map((notification) => (
          <li key={notification.id} className="py-2 border-b border-gray-200 last:border-b-0">
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </li>
        ))}
      </ul>
      <button onClick={onClear}>Очистить</button>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};
export default NotificationList;
