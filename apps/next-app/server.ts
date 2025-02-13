import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.WEBSOCKETPORT ? parseInt(process.env.WEBSOCKETPORT, 10) : 4000;
const httpServer = createServer();

interface UsersMap {
  [userId: string]: string;
}

const users: UsersMap = {};

const origin = process.env.SOCKET_ORIGIN || 'https://operator.garage.kg';

const io = new Server(httpServer, {
  cors: {
    origin: origin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
  transports: ['websocket'],
  path: '/socket.io',
});

io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);

  socket.on('hello', (value: any) => {
    console.log('HELLO', value);
  });

  socket.on('register', (userId: string) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket id ${socket.id}`);
  });

  socket.on('message', (message: any) => {
    io.emit('message', message);
  });

  socket.on('notification', (data: any) => {
    const { userId, notification } = data;
    const targetSocketId = users[userId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', notification);
      console.log(`Notification sent to user ${userId}`);
    } else {
      console.log(`User ${userId} not found`);
    }
  });

  socket.on('driverOrderNotification', (data: any) => {
    const { userId, notification } = data;
    const targetSocketId = users[userId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('driverOrderNotification', notification);
      console.log(`Driver Order Notification sent to user ${userId}`);
    } else {
      console.log(`User ${userId} not found`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});

console.log('WebSocket server started');

export { io, users };
