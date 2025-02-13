'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.URL || 'http://22';

console.log('SOCKET_URL', SOCKET_URL)

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});
