import { useContext, useEffect } from 'react';
import { SocketContext } from '@shared/utils/contexts/SocketContext';

export function useSocket(event?: string, callback?: (data: any) => void) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (event && callback && socket) {
      socket.on(event, callback);
    }

    return () => {
      socket?.off(event, callback);
    };
  }, [callback, event, socket]);

  return socket;
}
