'use client';

import { io } from 'socket.io-client';

export const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});
