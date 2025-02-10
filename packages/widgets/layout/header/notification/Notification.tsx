import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications } from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { LazyImage } from '@shared/components/ui/images';

interface NotificationIslandProps {
  userSession?: UserSession | null;
}

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const userId = useMemo(() => userSession?.uuid, [userSession]);
  const { notifications, clearNotifications, markAsRead } = useNotifications(userId);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  //Вычисляем количество непрочитанных уведомлений
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.addEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group"
        aria-label="Уведомления"
      >
        <LazyImage
          src="/icons/bell.svg"
          alt="notification-icon"
          className="w-[18px] h-[18px] duration-200 filter invert-0 group-hover:invert"
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div ref={notificationRef}>
          <NotificationList
            notifications={notifications}
            onClose={() => setIsOpen(false)}
            onClear={clearNotifications}
            markAsRead={markAsRead}
          />
        </div>
      )}
    </div>
  );
};
export default Notification;
