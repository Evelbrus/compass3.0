import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Notification, Action, UserRole } from '@prisma/client';
import { cn } from '@shared/lib';

interface UniversalNotificationListProps {
  userSession: { role?: UserRole } | null | undefined;
  notifications: Notification[];
  driverNotifications: Notification[];
  clientNotifications: Notification[];
  onClose: () => void;
  onClear?: () => void;
  markAsRead?: (notificationId: string) => void;
  openModal?: (notification: Notification) => void;
}

const NOTIFICATION_ICONS = {
  [Action.info]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-blue-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  [Action.warning]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-orange-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  [Action.success]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-green-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  [Action.noted]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-indigo-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
  ),
  [Action.inProgress]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-cyan-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  [Action.cancelled]: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-red-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const NOTIFICATION_COLORS = {
  [Action.info]: 'from-blue-50 to-blue-100 border-blue-200',
  [Action.warning]: 'from-orange-50 to-orange-100 border-orange-200',
  [Action.success]: 'from-green-50 to-green-100 border-green-200',
  [Action.noted]: 'from-indigo-50 to-indigo-100 border-indigo-200',
  [Action.inProgress]: 'from-cyan-50 to-cyan-100 border-cyan-200',
  [Action.cancelled]: 'from-red-50 to-red-100 border-red-200',
};

const NOTIFICATION_TITLES = {
  [Action.info]: 'Информация',
  [Action.warning]: 'Внимание',
  [Action.success]: 'Успешно',
  [Action.noted]: 'Отмечено',
  [Action.inProgress]: 'В процессе',
  [Action.cancelled]: 'Отменено',
};

const DRIVER_STATUS_TEXT = {
  [Action.info]: 'Информация о поездке',
  [Action.warning]: 'Требуется внимание',
  [Action.success]: 'Поездка успешно завершена',
  [Action.noted]: 'Заказ принят к сведению',
  [Action.inProgress]: 'Поездка началась',
  [Action.cancelled]: 'Поездка отменена',
};

const CLIENT_STATUS_TEXT = {
  [Action.info]: 'Информация о заказе',
  [Action.warning]: 'Проблема с заказом',
  [Action.success]: 'Заказ выполнен',
  [Action.noted]: 'Заказ подтвержден',
  [Action.inProgress]: 'Заказ в процессе',
  [Action.cancelled]: 'Заказ отменен',
};

const UniversalNotificationList: React.FC<UniversalNotificationListProps> = ({
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
  const [open, setOpen] = useState<Record<string, boolean>>({});

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

  const toggleOpen = (uuid: string) => {
    setOpen((prev) => ({ ...prev, [uuid]: !prev[uuid] || false }));
  };

  const groupedNotifications = getActiveNotifications().reduce(
    (groups, notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(notification);
      return groups;
    },
    {} as Record<string, Notification[]>,
  );

  const sortedDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const getStatusText = (action: Action) => {
    if (userSession?.role === UserRole.Driver)
      return DRIVER_STATUS_TEXT[action] || NOTIFICATION_TITLES[action];
    if (userSession?.role === UserRole.ClientCorp)
      return CLIENT_STATUS_TEXT[action] || NOTIFICATION_TITLES[action];
    return NOTIFICATION_TITLES[action];
  };

  const isModalSupported =
    userSession?.role === UserRole.Driver || userSession?.role === UserRole.ClientCorp;

  return (
    <div className="absolute w-[400px] max-h-[600px] right-0 top-10 z-50 bg-gradient-to-br from-white to-gray-50 p-4 flex flex-col gap-2 rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          {getTitle()}
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h1>
        <div className="flex gap-2">
          {onClear &&
            (userSession?.role === UserRole.Admin || userSession?.role === UserRole.Operator) &&
            getActiveNotifications().length > 0 && (
              <button
                onClick={onClear}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011-1h10a1 1 0 011 1v1h1a1 1 0 110 2H2a1 1 0 010-2h1V2a1 1 0 011-1zm1 4h10v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Очистить
              </button>
            )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
            aria-label="Закрыть"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {getActiveNotifications().length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-2 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p>У вас нет новых уведомлений</p>
        </div>
      ) : (
        <div className="overflow-y-auto custom-scrollbar max-h-[500px] pr-1">
          {sortedDates.map((date) => (
            <div key={date} className="mb-4">
              <div className="sticky top-0 bg-gradient-to-r from-gray-100 to-white py-1 px-2 text-sm text-gray-500 rounded-md mb-2 shadow-sm z-10">
                {new Date(date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
              <ul className="space-y-2">
                {groupedNotifications[date]?.map((notification, index) => {
                  const actionType = notification.action as Action;
                  const colorClass =
                    NOTIFICATION_COLORS[actionType] || NOTIFICATION_COLORS[Action.info];
                  const icon = NOTIFICATION_ICONS[actionType] || NOTIFICATION_ICONS[Action.info];
                  const customTitle = notification.title || getStatusText(actionType);

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
                        'p-3 border rounded-lg transition-all duration-200',
                        'bg-gradient-to-r',
                        colorClass,
                        !notification.read && 'border-l-4 shadow-md',
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div
                          className="flex items-start gap-2 cursor-pointer"
                          onClick={() => toggleOpen(notification.uuid)}
                        >
                          <div
                            className={cn(
                              'p-2 rounded-full',
                              actionType === Action.warning && 'bg-orange-100',
                              actionType === Action.success && 'bg-green-100',
                              actionType === Action.info && 'bg-blue-100',
                              actionType === Action.noted && 'bg-indigo-100',
                              actionType === Action.inProgress && 'bg-cyan-100',
                              actionType === Action.cancelled && 'bg-red-100',
                            )}
                          >
                            {icon}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={cn(
                                'text-sm font-semibold',
                                actionType === Action.warning && 'text-orange-800',
                                actionType === Action.success && 'text-green-800',
                                actionType === Action.info && 'text-blue-800',
                                actionType === Action.noted && 'text-indigo-800',
                                actionType === Action.inProgress && 'text-cyan-800',
                                actionType === Action.cancelled && 'text-red-800',
                              )}
                            >
                              {customTitle}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          {openModal && isModalSupported && (
                            <button
                              onClick={() => openModal(notification)}
                              className="p-1 bg-white bg-opacity-70 rounded-full text-cyan-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Перейти к заказу"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => toggleOpen(notification.uuid)}
                            className={cn(
                              'p-1 bg-white bg-opacity-70 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50',
                              'transition-transform duration-300',
                              open[notification.uuid] ? 'rotate-180' : '',
                            )}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-300 ease-in-out',
                          open[notification.uuid] ? 'max-h-96 mt-2' : 'max-h-0',
                        )}
                      >
                        <div className="text-sm text-gray-700 bg-white bg-opacity-60 p-3 rounded-md border border-gray-100">
                          {notification.message}
                          {openModal && isModalSupported && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                              <button
                                onClick={() => openModal(notification)}
                                className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md text-xs shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                Просмотреть заказ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalNotificationList;
