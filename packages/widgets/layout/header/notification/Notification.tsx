import { useMemo, useState } from 'react';
import { useNotifications } from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface NotificationIslandProps {
  userSession?: UserSession | null;
}

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const userId = useMemo(() => userSession?.uuid, [userSession]);
  const { notifications, clearNotifications, markAsRead } = useNotifications(userId);

  //Вычисляем количество непрочитанных уведомлений
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Уведомления"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationList
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onClear={clearNotifications}
          markAsRead={markAsRead}
        />
      )}
    </div>
  );
};
export default Notification;
