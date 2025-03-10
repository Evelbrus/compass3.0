import React, { useEffect, useRef, useCallback } from 'react';
import { OrderStatus, UserRole } from '@prisma/client';
import { cn } from '@shared/lib';
import { SafeHtml } from '@shared/lib/sanitize-html/SafeHtml';
import { NotificationListProps } from '@widgets/layout/header/notification/types/types';
import {
  formatNotificationDate,
  getButtonText,
  groupNotificationsByDate,
} from '@widgets/layout/header/notification/utils/notificationUtils';
import { getNotificationIcon } from '@widgets/layout/header/notification/components/notificationIncons';
import {
  ExtendedNotification,
  getOrderStatusFromNotification,
} from '@features/notifications/lib/useNotifications';

const UniversalNotificationList: React.FC<NotificationListProps> = ({
  userSession,
  notifications,
  driverNotifications,
  clientNotifications,
  onClose,
  onClear,
  markAsRead,
  openModal,
}) => {
  const notificationRefs = useRef<(HTMLLIElement | null)[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  // Определяем, какие роли могут просматривать заказы
  const canViewOrder = (notification: ExtendedNotification) => {
    if (!openModal || !notification.orderId) return false;

    // Все роли могут просматривать детали заказа
    return (
      userSession?.role === UserRole.Driver ||
      userSession?.role === UserRole.ClientCorp ||
      userSession?.role === UserRole.Admin ||
      userSession?.role === UserRole.Operator
    );
  };

  console.log('clientNotifications', clientNotifications);
  console.log('userSession', userSession);

  const getActiveNotifications = () => {
    switch (userSession?.role) {
      case UserRole.Driver:
        return driverNotifications;
      case UserRole.ClientCorp:
        return clientNotifications;
      default:
        return notifications;
    }
  };

  const getTitle = () => {
    switch (userSession?.role) {
      case UserRole.Driver:
        return 'Уведомления водителя';
      case UserRole.ClientCorp:
        return 'Уведомления клиента';
      default:
        return 'Уведомления';
    }
  };

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!markAsRead) return;
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const uuid = target.dataset.uuid;
        if (uuid) {
          const notification = getActiveNotifications().find((n) => n.uuid === uuid);
          if (entry.isIntersecting && notification && !notification.read) {
            markAsRead(uuid);
            observer.current?.unobserve(target);
          }
        }
      });
    },
    [markAsRead, getActiveNotifications],
  );

  useEffect(() => {
    if (
      markAsRead &&
      (userSession?.role === UserRole.Admin || userSession?.role === UserRole.Operator)
    ) {
      observer.current = new IntersectionObserver(handleIntersection, { threshold: 0.5 });
      notificationRefs.current.forEach((ref) => {
        if (ref) observer.current?.observe(ref);
      });
      return () => observer.current?.disconnect();
    }
  }, [handleIntersection, userSession?.role]);

  // Используем безопасный утилитарный метод для группировки
  const { groupedNotifications, sortedDates } = groupNotificationsByDate(getActiveNotifications());

  return (
    <div className="absolute w-[500px] max-h-[600px] right-0 top-20 z-50 bg-white p-0 flex flex-col rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* Заголовок в стиле Uber */}
      <div className="flex justify-between items-center py-4 px-6 bg-black text-white sticky top-0 z-10">
        <h1 className="text-lg font-medium tracking-tight">{getTitle()}</h1>
        <div className="flex gap-2">
          {onClear &&
            (userSession?.role === UserRole.Admin || userSession?.role === UserRole.Operator) &&
            getActiveNotifications().length > 0 && (
              <button
                onClick={onClear}
                className="text-white opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Очистить"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            )}
          <button
            onClick={onClose}
            className="text-white opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Закрыть"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {getActiveNotifications().length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 mb-4 text-gray-300"
          >
            <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 2 2h16a2 2 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
          </svg>
          <p className="text-center font-light">У вас пока нет уведомлений</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[550px]">
          {sortedDates.map((dateKey) => {
            const dateGroup = groupedNotifications[dateKey];

            // Защита от undefined
            if (!dateGroup) {
              return null;
            }

            return (
              <div key={dateKey}>
                <div className="px-6 py-2 sticky top-0 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium z-10 border-b border-gray-100">
                  {formatNotificationDate(dateGroup.date)}
                </div>

                <ul className="divide-y divide-gray-100">
                  {dateGroup.notifications.map((notification, index) => {
                    const status = getOrderStatusFromNotification(notification);
                    const icon = getNotificationIcon(status);

                    return (
                      <li
                        key={notification.uuid}
                        ref={(el) => {
                          if (
                            markAsRead &&
                            (userSession?.role === UserRole.Admin ||
                              userSession?.role === UserRole.Operator)
                          ) {
                            notificationRefs.current[index] = el;
                          }
                        }}
                        data-uuid={notification.uuid}
                        className={cn(
                          'relative py-4 px-6 transition-colors hover:bg-gray-50 cursor-pointer',
                          !notification.read ? 'bg-gray-50' : 'bg-white',
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h3
                                className={cn(
                                  'text-sm',
                                  !notification.read ? 'font-semibold' : 'font-normal',
                                )}
                              >
                                {notification.title || 'Уведомление'}
                              </h3>
                              <p className="text-xs text-gray-400 ml-2">
                                {new Date(notification.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Bishkek',
                                })}
                              </p>
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                              <SafeHtml html={notification.message || ''} />
                            </div>

                            {canViewOrder(notification) && (
                              <div className="mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal && openModal(notification);
                                    onClose();
                                  }}
                                  className={cn(
                                    'text-xs py-1 px-4 rounded-full border transition-colors flex items-center gap-1',
                                    status === OrderStatus.COMPLETED ||
                                      status === OrderStatus.CANCELLED
                                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                      : 'border-black bg-black text-white hover:bg-gray-900',
                                  )}
                                >
                                  {getButtonText(notification)}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!notification.read && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full"></div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UniversalNotificationList;
