import React, { useState, useRef, useEffect } from 'react';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import DriverNotificationList from '@widgets/layout/header/notification/DriverNotificationList';
import ClientNotificationList from '@widgets/layout/header/notification/ClientNotificationList';
import { LazyImage } from '@shared/components/ui/images';
import { UserRole } from '@prisma/client';
import OrderDriverModal from '@widgets/orders/modal/order-management/driver/OrderDriverModal';
import OrderTrackingModal from '@widgets/orders/modal/order-management/client-corp/OrderTrackingModal';
import WarningAdminModal from '@widgets/orders/modal/order-management/admin/WarningAdminModal';

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
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
        setIsOpen(false);
        setIsDriverOpen(false);
        setIsClientOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
      setIsDriverOpen(false);
      setIsClientOpen(false);
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
        {userSession?.role === UserRole.Driver && driverNotifications.length > 0 && (
          <button
            onClick={() => setIsDriverOpen(!isDriverOpen)}
            className="mr-2 p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group"
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

        {userSession?.role === UserRole.ClientCorp && clientNotifications.length > 0 && (
          <button
            onClick={() => setIsClientOpen(!isClientOpen)}
            className="mr-2 p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group"
            aria-label="Уведомления клиента"
          >
            <LazyImage
              src="/icons/client-bell.svg"
              alt="client-notification-icon"
              className="w-[18px] h-[18px] duration-200 filter invert-0 group-hover:invert"
            />
            {clientUnreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-green-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {clientUnreadCount}
              </span>
            )}
          </button>
        )}

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

        {isDriverOpen && (
          <div ref={notificationRef}>
            <DriverNotificationList
              notifications={driverNotifications}
              onClose={() => setIsDriverOpen(false)}
              openModal={openModal}
            />
          </div>
        )}

        {isClientOpen && (
          <div ref={notificationRef}>
            <ClientNotificationList
              notifications={clientNotifications}
              onClose={() => setIsClientOpen(false)}
              openModal={openModal}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Notification;
