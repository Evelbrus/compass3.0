'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { NotificationList } from '@features/notifications/ui';

export interface Notification {
  id: string;
  title: string;
  message: string;
}

interface NotificationIslandProps {
  userId?: string;
}

const NotificationIsland = ({ userId }: NotificationIslandProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [...prev, { ...notification, id: Date.now().toString() }]);
  }, []);

  const socket = useSocket('notification', handleNotification);

  useEffect(() => {
    if (!socket || !userId) return;

    const registerUser = () => {
      socket.emit('register', userId);
    };

    if (socket.connected) {
      registerUser();
    } else {
      socket.on('connect', registerUser);
    }

    return () => {
      socket.off('connect', registerUser);
      socket.off('notification');
    };
  }, [socket, userId]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Уведомления"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationList
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onClear={() => setNotifications([])}
        />
      )}
    </div>
  );
};

export default NotificationIsland;
