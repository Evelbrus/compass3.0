import { useContext, useEffect } from 'react';
import { SocketContext } from '@shared/utils/contexts/SocketContext';

export function useSocket(event?: string, callback?: (data: any) => void) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) {
      console.warn('Socket не доступен в useSocket');
      return;
    }

    if (!event || !callback) return;

    socket.on(event, callback);
    console.log(`Событие "${event}" зарегистрировано в useSocket`);

    return () => {
      socket.off(event, callback);
      console.log(`Событие "${event}" удалено в useSocket`);
    };
  }, [socket, event, callback]);

  return socket;
}