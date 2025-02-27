import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import UniversalNotificationList from '@widgets/layout/header/notification/UniversalNotificationList';
import { UserRole } from '@prisma/client';
import OrderDriverModal from '@widgets/orders/modal/order-management/driver/OrderDriverModal';
import OrderTrackingModal from '@widgets/orders/modal/order-management/client-corp/OrderTrackingModal';
import WarningAdminModal from '@widgets/orders/modal/order-management/admin/WarningAdminModal';
import { cn } from '@shared/lib';

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
    clearNotifications,
    markAsRead,
    activeNotification,
    openModal,
    closeModal,
    shouldShowModal,
  } = useNotifications({ userSession });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
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

  const getBellIcon = () => {
    switch (userSession?.role) {
      case UserRole.Driver:
        return '/icons/bell.svg';
      case UserRole.ClientCorp:
        return '/icons/bell.svg';
      default:
        return '/icons/bell.svg';
    }
  };

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

  return (
    <>
      {shouldShowModal && activeNotification && (
        <>
          {userSession?.role === UserRole.Driver && (
            <OrderDriverModal
              isOpen={true}
              onClose={closeModal}
              notification={activeNotification}
              getDriverNotifications={() => driverNotifications}
              userRole={userSession.role}
            />
          )}
          {userSession?.role === UserRole.ClientCorp && (
            <OrderTrackingModal
              isOpen={true}
              onClose={closeModal}
              notification={activeNotification}
              getClientNotifications={() => clientNotifications}
              userRole={userSession.role}
            />
          )}
          {(userSession?.role === UserRole.Admin || userSession?.role === UserRole.Operator) && (
            <WarningAdminModal
              isOpen={true}
              onClose={closeModal}
              notification={activeNotification}
              notifications={notifications}
              userRole={userSession.role}
            />
          )}
        </>
      )}

      <div className="relative flex items-center">
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group"
          aria-label="Уведомления"
        >
          <Image
            src={getBellIcon()}
            alt="notification-icon"
            width={18}
            height={18}
            className="duration-200 filter invert-0 group-hover:invert"
          />
          {getUnreadCount() > 0 && (
            <span
              className={cn(
                'absolute top-0 right-0 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center',
                userSession?.role === UserRole.Driver && 'bg-blue-500',
                userSession?.role === UserRole.ClientCorp && 'bg-green-500',
                (userSession?.role === UserRole.Admin || userSession?.role === UserRole.Operator) &&
                  'bg-red-500',
              )}
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
              onClear={clearNotifications}
              markAsRead={markAsRead}
              openModal={openModal}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Notification;
