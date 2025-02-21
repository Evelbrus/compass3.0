import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import DriverNotificationList from '@widgets/layout/header/notification/DriverNotificationList';
import { LazyImage } from '@shared/components/ui/images';
import { Action, UserRole } from '@prisma/client';
import OrderInfoModal from '@widgets/orders/modal/driver/order-management/OrderInfoModal';
import OrderProgressModal from '@widgets/orders/modal/driver/order-management/OrderProgressModal';
import WarningModal from '@widgets/orders/modal/driver/order-management/WarningModal';
import WarningAdminModal from '@widgets/orders/modal/driver/order-management/WarningAdminModal';

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    getDriverNotifications,
    clearNotifications,
    markAsRead,
    activeNotification,
    openModal,
    closeModal,
  } = useNotifications({ userSession });

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const driverNotifications = useMemo(
    () =>
      notifications.filter(
        (n) =>
          n.action === Action.noted ||
          n.action === Action.inProgress ||
          n.action === Action.warning,
      ),
    [notifications],
  );
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
    <>
      {activeNotification && (
        <>
          {activeNotification.action === Action.noted && userSession?.role === UserRole.Driver && (
            <OrderInfoModal isOpen={true} onClose={closeModal} notification={activeNotification} />
          )}
          {activeNotification.action === Action.inProgress &&
            userSession?.role === UserRole.Driver && (
              <OrderProgressModal
                isOpen={true}
                onClose={closeModal}
                notification={activeNotification}
                getDriverNotifications={getDriverNotifications}
              />
            )}
          {activeNotification.action === Action.warning &&
            userSession?.role === UserRole.Driver && (
              <WarningModal
                isOpen={true}
                onClose={closeModal}
                notification={activeNotification}
                getDriverNotifications={getDriverNotifications}
              />
            )}
          {activeNotification.action === Action.warning &&
            (userSession?.role === UserRole.Operator || userSession?.role === UserRole.Admin) && (
              <WarningAdminModal
                isOpen={true}
                onClose={closeModal}
                notification={activeNotification}
              />
            )}
        </>
      )}

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

        {userSession?.role === UserRole.Driver && (
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

        {isDriverOpen && (
          <div ref={notificationRef}>
            <DriverNotificationList
              notifications={driverNotifications}
              onClose={() => setIsDriverOpen(false)}
              openModal={openModal}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Notification;
