import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN, {
  transports: ['websocket'],
  path: '/socket.io',
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});
