import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  useNotifications,
  NotificationIslandProps,
} from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import DriverNotificationList from '@widgets/layout/header/notification/DriverNotificationList';
import ClientNotificationList from '@widgets/layout/header/notification/ClientNotificationList';
import { LazyImage } from '@shared/components/ui/images';
import { Action, UserRole } from '@prisma/client';
import OrderInfoModal from '@widgets/orders/modal/driver/order-management/OrderInfoModal';
import OrderProgressModal from '@widgets/orders/modal/driver/order-management/OrderProgressModal';
import WarningModal from '@widgets/orders/modal/driver/order-management/WarningModal';
import WarningAdminModal from '@widgets/orders/modal/driver/order-management/WarningAdminModal';
import OrderTrackingModal from '@widgets/orders/modal/driver/order-management/OrderTrackingModal';
import { showToast } from '@shared/components/toast/ToastManager';

const Notification = ({ userSession }: NotificationIslandProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    getDriverNotifications,
    getClientNotifications,
    clearNotifications,
    markAsRead,
    activeNotification,
    openModal,
    closeModal,
  } = useNotifications({ userSession });

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const driverNotifications = useMemo(
    () => (userSession?.role === UserRole.Driver ? getDriverNotifications(userSession.uuid) : []),
    [notifications, userSession, getDriverNotifications],
  );
  const driverUnreadCount = useMemo(
    () => driverNotifications.filter((n) => !n.read).length,
    [driverNotifications],
  );

  const clientNotifications = useMemo(
    () =>
      userSession?.role === UserRole.ClientCorp ? getClientNotifications(userSession.uuid) : [],
    [notifications, userSession, getClientNotifications],
  );
  const clientUnreadCount = useMemo(
    () => clientNotifications.filter((n) => !n.read).length,
    [clientNotifications],
  );

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
          {activeNotification && (
            <>
              {activeNotification.action === Action.warning &&
                (userSession?.role === UserRole.Operator || userSession?.role === UserRole.Admin) && (
                  console.log('Роль пользователя:', userSession?.role),
                  console.log('Попытка открыть WarningAdminModal для:', activeNotification),
                    <WarningAdminModal
                      isOpen={true}
                      onClose={closeModal}
                      notification={activeNotification}
                      notifications={notifications}
                    />
                )}
            </>
          )}
          {activeNotification.action === Action.inProgress &&
            userSession?.role === UserRole.ClientCorp && (
              <OrderTrackingModal
                isOpen={true}
                onClose={closeModal}
                notification={activeNotification}
                getClientNotifications={getClientNotifications} // Передаем для отслеживания уведомлений
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