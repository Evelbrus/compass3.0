'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@socket';
import { SocketContext } from '@shared/utils/contexts/SocketContext';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected); // Изначально проверяем состояние сокета

  useEffect(() => {
    // Обработчик успешного подключения
    const onConnect = () => {
      setIsConnected(true);
    };

    // Обработчик отключения
    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Подписываемся на события
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Если сокет не подключен, инициируем подключение
    if (!socket.connected) {
      socket.connect();
    } else {
      setIsConnected(true); // Если подключен изначально, сразу обновляем состояние
    }

    // Очистка подписок при размонтировании
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={isConnected ? socket : null}>
      {children}
    </SocketContext.Provider>
  );
};