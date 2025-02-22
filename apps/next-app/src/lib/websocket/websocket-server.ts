import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server, Socket } from 'socket.io';
import { Notification } from '@prisma/client';

// Определяем, какой файл использовать (.env.development или .env.production)
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const port = process.env.WEBSOCKET_PORT;

interface UserInfo {
  socketId: string;
  role: string;
}

export const users: { [userId: string]: UserInfo } = {};
export const usersByRole: { [role: string]: Set<string> } = {
  operator: new Set(),
  admin: new Set(),
};

interface IndividualNotificationData {
  userId: string;
  notification: Notification;
}

interface BroadcastNotificationData {
  roles: string[];
  notification: Notification;
}

type NotificationData = IndividualNotificationData | BroadcastNotificationData;

export let io: Server | null = null;

const createServer = () => {
  if (
    process.env.SSL_KEY_PATH &&
    process.env.SSL_CERT_PATH &&
    fs.existsSync(path.resolve(process.env.SSL_KEY_PATH)) &&
    fs.existsSync(path.resolve(process.env.SSL_CERT_PATH))
  ) {
    const sslOptions = {
      key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
      cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH)),
    };
    console.log('Используется HTTPS-сервер');
    return createHttpsServer(sslOptions);
  } else {
    console.log('Используется HTTP-сервер');
    return createHttpServer();
  }
};

export const startWebSocketServer = () => {
  if (io) {
    console.log('WebSocket-сервер уже запущен');
    return;
  }

  const server = createServer();
  const origin = process.env.NEXT_PUBLIC_URL || '*';
  io = new Server(server, {
    cors: {
      origin: origin,
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
    transports: ['websocket'],
    path: '/socket.io',
  });

  console.log(`WebSocket-сервер запущен на порту ${port}`);

  io.on('connection', (socket: Socket) => {
    console.log('Новый клиент подключен', socket.id);

    socket.on('register', (data: { userId: string; role?: string }) => {
      if (!data.role) {
        console.warn(`Регистрация пользователя ${data.userId} без роли`);
        return;
      }
      const role = data.role.toLowerCase();
      users[data.userId] = { socketId: socket.id, role };
      if (usersByRole[role]) {
        usersByRole[role].add(data.userId);
      } else {
        usersByRole[role] = new Set([data.userId]);
      }
      console.log(`Пользователь ${data.userId} с ролью ${role} зарегистрирован с socket id ${socket.id}`);
    });

    socket.on('notification', (data: NotificationData) => {
      if ('roles' in data) {
        const { roles, notification } = data as BroadcastNotificationData;
        roles.forEach((role: string) => {
          const lowerRole = role.toLowerCase();
          const userIds = usersByRole[lowerRole];
          if (userIds) {
            userIds.forEach((userId) => {
              const userInfo = users[userId];
              if (userInfo) {
                io!.to(userInfo.socketId).emit('notification', notification);
                console.log(`Широковещательное уведомление отправлено пользователю ${userId} (роль: ${lowerRole})`);
              }
            });
          }
        });
      } else {
        const { userId, notification } = data as IndividualNotificationData;
        const targetSocketId = users[userId]?.socketId;
        if (targetSocketId) {
          io!.to(targetSocketId).emit('notification', notification);
          console.log(`Уведомление отправлено пользователю ${userId}`);
        } else {
          console.log(`Пользователь ${userId} не найден или не подключен`);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Клиент отключился', socket.id);
      for (const userId in users) {
        if (users[userId].socketId === socket.id) {
          const role = users[userId].role;
          delete users[userId];
          if (usersByRole[role]) {
            usersByRole[role].delete(userId);
          }
          console.log(`Пользователь ${userId} отключился`);
          break;
        }
      }
    });
  });

  server.listen(port, () => {
    console.log(`Сервер прослушивает порт ${port}`);
  });
};

startWebSocketServer();
