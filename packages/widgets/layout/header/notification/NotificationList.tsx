import React, { useEffect, useRef, useCallback } from 'react';
import { Notification } from '@features/notifications/lib/useNotifications';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';

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

  return (
    <div className="absolute w-[400px] h-[400px] right-0 top-10 z-50 bg-white p-4 rounded-md shadow-lg overflow-auto">
      <IButton
        variant="close"
        onClick={onClose}
        aria-label="Закрыть модальное окно"
        className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
      >
        <CloseIcon />
      </IButton>
      <ul className="max-h-68 overflow-y-auto mt-4">
        {notifications.map((notification, index) => (
          <li
            key={notification.uuid}
            className="py-2 border-b border-gray-200 last:border-b-0"
            ref={(el) => {
              if (el) {
                notificationRefs.current[index] = el;
              }
            }}
            data-uuid={notification.uuid}
          >
            <TextInput
              label={`${notification.title}:`}
              value={notification.message}
              onChange={() => null}
              classNameLabel="font-medium text-sm text-gray-600"
              classNamePlaceholder="font-semibold text-sm"
              disabled
            />
          </li>
        ))}
      </ul>
      <button onClick={onClear} className="text-sm font-semibold text-red-500 hover:text-red-600">
        Очистить
      </button>
    </div>
  );
};

export default NotificationList;
