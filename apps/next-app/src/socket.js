'use client';

import { io } from 'socket.io-client';

export const socket = io('https://operator.garage.kg', {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});
