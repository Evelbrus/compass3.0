import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Notification } from '@prisma/client';

dotenv.config();

const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT, 10) : 4000;

let server: ReturnType<typeof createHttpServer> | ReturnType<typeof createHttpsServer>;

//Если заданы пути к SSL-ключу и сертификату, и файлы существуют, запускаем HTTPS-сервер
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
  server = createHttpsServer(sslOptions);
  console.log('Using HTTPS server');
} else {
  //Если ключи не заданы или файлы не найдены – запускаем HTTP-сервер
  server = createHttpServer();
  console.log('Using HTTP server');
}

//Интерфейс для хранения информации о пользователе
interface UserInfo {
  socketId: string;
  role: string;
}

//Основной объект для хранения всех пользователей (по userId)
const users: { [userId: string]: UserInfo } = {};

//Дополнительная структура для группировки активных соединений по ролям
const usersByRole: { [role: string]: Set<string> } = {
  operator: new Set(),
  admin: new Set(),
};

//Тип для структуры сообщения
interface Message {
  content: string;
}

//Типы для события notification
interface IndividualNotificationData {
  userId: string;
  notification: Notification;
}

interface BroadcastNotificationData {
  roles: string[];
  notification: Notification;
}

type NotificationData = IndividualNotificationData | BroadcastNotificationData;

//Интерфейс для всех событий сокета
interface SocketEvents {
  register: (data: { userId: string; role?: string }) => void;
  message: (message: Message) => void;
  notification: (data: NotificationData) => void;
  disconnect: () => void;
}

const origin = process.env.NEXT_PUBLIC_URL || '*';

const io = new Server(server, {
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

  //Обработчик регистрации
  socket.on('register', ((data: { userId: string; role?: string }) => {
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

    console.log(`User ${data.userId} with role ${role} registered with socket id ${socket.id}`);
  }) as SocketEvents['register']);

  //Обработчик сообщения
  socket.on('message', ((message: Message) => {
    io.emit('message', message);
  }) as SocketEvents['message']);

  //Обработчик уведомления
  socket.on('notification', ((data: NotificationData) => {
    console.log('Получено событие notification на сервере. Данные:', data);

    if ('roles' in data) {
      const { roles, notification } = data as BroadcastNotificationData;
      console.log('Broadcasting notification for roles:', roles);

      roles.forEach((role: string) => {
        const lowerRole = role.toLowerCase();
        const userIds = usersByRole[lowerRole];
        if (userIds) {
          userIds.forEach((userId) => {
            const userInfo = users[userId];
            if (userInfo) {
              io.to(userInfo.socketId).emit('notification', notification);
              console.log(`Broadcast notification sent to user ${userId} (role: ${lowerRole})`);
            }
          });
        }
      });
    } else {
      const { userId, notification } = data as IndividualNotificationData;
      console.log('Индивидуальное уведомление для userId:', userId);
      const targetSocketId = users[userId]?.socketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId}`);
      } else {
        console.log(`User ${userId} not found`);
      }
    }
  }) as SocketEvents['notification']);

  //Обработчик отключения
  socket.on('disconnect', (() => {
    console.log('Client disconnected', socket.id);
    for (const userId in users) {
      if (users[userId].socketId === socket.id) {
        const role = users[userId].role;
        delete users[userId];
        if (usersByRole[role]) {
          usersByRole[role].delete(userId);
        }
        break;
      }
    }
  }) as SocketEvents['disconnect']);
});

server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});

export { io, users, usersByRole };
