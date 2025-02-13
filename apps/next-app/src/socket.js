'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.URL || 'http://localhost:3008';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});
