import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Notification } from '@features/notifications/lib/useNotifications';
import { openModal, setDriverOrderUuid } from '@shared/lib/effector';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';

interface DriverNotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
}

const DriverNotificationList: React.FC<DriverNotificationListProps> = ({
  notifications,
  onClose,
  onClear,
}) => {
  //Сохраняем ссылки на элементы уведомлений для работы с IntersectionObserver
  const notificationRefs = useRef<HTMLLIElement[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  //Локальное состояние для сворачивания/разворачивания уведомлений
  const [open, setOpen] = useState<Record<string, boolean>>(
    notifications.reduce(
      (acc, notification) => {
        acc[notification.uuid] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  //Если нужно добавить функционал «прочтения при видимости», можно использовать IntersectionObserver
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      const uuid = target.dataset.uuid;
      //Здесь можно реализовать логику отметки уведомления как прочитанного, если потребуется
      if (entry.isIntersecting && uuid) {
        //Например, вызвать markAsRead(uuid) если такая функция предусмотрена
        observer.current?.unobserve(target);
      }
    });
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });
    notificationRefs.current.forEach((ref) => {
      if (ref) {
        observer.current?.observe(ref);
      }
    });
    return () => {
      observer.current?.disconnect();
      notificationRefs.current = [];
    };
  }, [handleIntersection, notifications]);

  //Переключение сворачивания/разворачивания уведомления
  const toggleOpen = (uuid: string) => {
    setOpen((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  //Обработка клика по уведомлению: устанавливаем идентификатор заказа и открываем модалку
  const handleNotificationClick = (notification: Notification) => {
    setDriverOrderUuid(notification.orderId);
    openModal('orderProgressModal');
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
            className="p-2 border-b border-gray-200 rounded-lg last:border-b-0 bg-white mb-1 cursor-pointer"
            ref={(el) => {
              if (el) {
                notificationRefs.current[index] = el;
              }
            }}
            data-uuid={notification.uuid}
            onClick={() => {
              toggleOpen(notification.uuid);
              handleNotificationClick(notification);
            }}
          >
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-600">{notification.title}</p>
              <span
                className={`transform transition-transform ${
                  open[notification.uuid] ? 'rotate-180' : 'rotate-0'
                }`}
              >
                ▼
              </span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                open[notification.uuid] ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <p className="text-sm text-gray-500 mt-2">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <IButton
        onClick={onClear}
        className="mt-2 p-2 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition text-sm w-full"
      >
        Очистить уведомления
      </IButton>
    </div>
  );
};

export default DriverNotificationList;
