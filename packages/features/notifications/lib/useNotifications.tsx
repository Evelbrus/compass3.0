import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';

export interface Notification {
  id: string;
  title: string;
  message: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, clearNotifications };
};
