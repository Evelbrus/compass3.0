//src/socket-server.ts
import { io } from 'socket.io-client';

//Указываем URL вашего WebSocket-сервера (например, порт 4000 из server.js)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_ORIGIN || 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  path: '/socket.io',
  autoConnect: true,
});

//Логи для отладки
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server from server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server from server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error.message);
});
