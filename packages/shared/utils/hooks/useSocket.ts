import { useContext, useEffect } from 'react';
import { SocketContext } from '@shared/utils/contexts/SocketContext';
import { Socket } from 'socket.io-client';

type SocketType = Socket | null;

// Убираем значение по умолчанию T = any, делаем T обязательным
export function useSocket<T>(event?: string, callback?: (data: T) => void): SocketType {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) {
      console.warn('Socket не доступен в useSocket');
      return;
    }

    if (!event || !callback) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);

  return socket;
}
