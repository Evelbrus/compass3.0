'use client';

import React from 'react';
import { socket } from '@socket';
import { useEffect, useState } from 'react';
import { SocketContext } from '@shared/utils/contexts/SocketContext';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onConnect = () => {};

    const onDisconnect = () => {
      console.log('Socket disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) {
      socket.connect();
      setIsReady(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={isReady ? socket : null}>{children}</SocketContext.Provider>
  );
};
