'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_ORIGIN;

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: true,
});
