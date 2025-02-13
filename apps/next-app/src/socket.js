'use client';

import { io } from 'socket.io-client';

console.log('process.env', process.env);
const SOCKET_URL = process.env.NEXT_PUBLIC_URL;

console.log('SOCKET_URL', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
});
