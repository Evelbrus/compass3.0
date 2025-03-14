import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UserRole } from '@prisma/client';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import UniversalNotificationList from '@widgets/layout/header/notification/UniversalNotificationList';

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    driverNotifications,
    driverUnreadCount,
    clientNotifications,
    clientUnreadCount,
    markAsRead,
    openModal,
  } = useNotifications({ userSession });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('button[aria-label="Уведомления"]')
        )
      ) {
        setIsNotificationOpen(false);
      }
    };
    const handleScroll = () => {
      setIsNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getUnreadCount = () => {
    switch (userSession?.role) {
      case UserRole.Driver:
        return driverUnreadCount;
      case UserRole.ClientCorp:
        return clientUnreadCount;
      default:
        return unreadCount;
    }
  };

  const handleToggleNotifications = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
    } else {
      setIsNotificationOpen(true);
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleToggleNotifications}
        className="p-3 rounded-full bg-white border shadow-md transition-colors group"
        aria-label="Уведомления"
        aria-expanded={isNotificationOpen}
      >
        <Image
          src="/icons/bell.svg"
          alt="notification-icon"
          width={18}
          height={18}
          className="duration-200 filter invert"
        />
        {getUnreadCount() > 0 && (
          <span
            className={
              'absolute top-0 right-0 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center bg-red-500'
            }
          >
            {getUnreadCount()}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div ref={notificationRef}>
          <UniversalNotificationList
            userSession={userSession}
            notifications={notifications}
            driverNotifications={driverNotifications}
            clientNotifications={clientNotifications}
            onClose={() => setIsNotificationOpen(false)}
            markAsRead={markAsRead}
            openModal={openModal}
          />
        </div>
      )}
    </div>
  );
};

export default Notification;
