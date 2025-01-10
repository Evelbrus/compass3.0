import WebSocket, { WebSocketServer } from 'ws';
import { DriverProfile } from '@prisma/client';

interface DriverWebSocket extends WebSocket {
  driverId?: string;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: DriverWebSocket) => {
  console.log('Client connected');

  ws.on('message', (message: WebSocket.RawData) => {
    //Преобразуем сообщение в строку
    const data = JSON.parse(message.toString()) as { driverId?: string };

    if (data.driverId) {
      ws.driverId = data.driverId;
    }

    console.log(`Received message => ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

export function sendNotification(
  driverProfile: DriverProfile,
  message: { title: string; message: string },
) {
  wss.clients.forEach((client: DriverWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.driverId === driverProfile.uuid) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log('WebSocket server running on ws://localhost:8080');
