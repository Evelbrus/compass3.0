import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Notification } from '@features/notifications/lib/useNotifications';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { IButton } from '@shared/components/ui/buttons';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
  markAsRead: (notificationId: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onClose,
  onClear,
  markAsRead,
}) => {
  const notificationRefs = useRef<HTMLLIElement[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>(
    notifications.reduce(
      (acc, notification) => {
        acc[notification.uuid] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const uuid = target.dataset.uuid;

        //Find the notification in the notifications array
        const notification = notifications.find((n) => n.uuid === uuid);

        //Check if the notification exists and is not yet read
        if (entry.isIntersecting && uuid && notification && !notification.read) {
          markAsRead(uuid);
          observer.current?.unobserve(target);
        }
      });
    },
    [markAsRead, notifications],
  );

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });

    //Observe each notification
    notificationRefs.current.forEach((ref) => {
      if (ref) {
        observer.current?.observe(ref);
      }
    });

    return () => {
      //Cleanup: Unobserve all notifications
      observer.current?.disconnect();
      notificationRefs.current = [];
    };
  }, [handleIntersection, notifications]);

  const toggleOpen = (uuid: string) => {
    setOpen((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  return (
    <div className="absolute w-[400px] h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 rounded-md shadow-lg overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Уведомления</h1>
        <IButton
          variant="close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
        >
          <CloseIcon />
        </IButton>
      </div>
      <ul className="max-h-68 overflow-y-auto">
        {notifications.map((notification, index) => (
          <li
            key={notification.uuid}
            className="p-2 border-b border-gray-200 rounded-lg last:border-b-0 bg-white mb-1"
            ref={(el) => {
              if (el) {
                notificationRefs.current[index] = el;
              }
            }}
            data-uuid={notification.uuid}
            onClick={() => toggleOpen(notification.uuid)}
          >
            <p className="text-4 py-1 font-medium text-gray-500 flex items-center justify-between">
              {notification.title}{' '}
              <span>
                {new Date(notification.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={`transform transition-transform ${open[notification.uuid] ? 'rotate-180' : 'rotate-0'}`}
              >
                ▼
              </span>
            </p>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${open[notification.uuid] ? 'max-h-screen' : 'max-h-0'}`}
            >
              <p className="font-semibold text-sm p-2 border-t border-gray-300">
                {notification.message}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onClear}
        className=" p-2 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition text-sm"
      >
        Очистить
      </button>
    </div>
  );
};

export default NotificationList;
