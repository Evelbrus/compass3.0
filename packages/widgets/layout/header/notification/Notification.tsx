import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import DriverNotificationList from '@widgets/layout/header/notification/DriverNotificationList';
import { LazyImage } from '@shared/components/ui/images';
import { Action } from '@prisma/client';

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  //Получаем уведомления
  const { notifications, clearNotifications, markAsRead } = useNotifications({ userSession });

  //Общее количество непрочитанных уведомлений
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  //Фильтрация уведомлений для водителя
  const driverNotifications = useMemo(
    () => notifications.filter((n) => n.action === Action.noted || n.action === Action.inProgress),
    [notifications],
  );

  //Количество непрочитанных уведомлений для водителя
  const driverUnreadCount = useMemo(
    () => driverNotifications.filter((n) => !n.read).length,
    [driverNotifications],
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsDriverOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
      setIsDriverOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/*Общая кнопка уведомлений */}
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

      {/*Кнопка для уведомлений водителя */}
      {userSession?.role === 'Driver' && (
        <button
          onClick={() => setIsDriverOpen(!isDriverOpen)}
          className="ml-2 p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group"
          aria-label="Уведомления водителя"
        >
          <LazyImage
            src="/icons/driver-bell.svg"
            alt="driver-notification-icon"
            className="w-[18px] h-[18px] duration-200 filter invert-0 group-hover:invert"
          />
          {driverUnreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
              {driverUnreadCount}
            </span>
          )}
        </button>
      )}

      {/*Список общих уведомлений */}
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

      {/*Список уведомлений водителя */}
      {isDriverOpen && (
        <div ref={notificationRef}>
          <DriverNotificationList notifications={driverNotifications} />
        </div>
      )}
    </div>
  );
};

export default Notification;
