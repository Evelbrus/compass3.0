import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();
const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT, 10) : 4000;
let server;
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
//Основной объект для хранения всех пользователей (по userId)
const users = {};
//Дополнительная структура для группировки активных соединений по ролям
const usersByRole = {
  operator: new Set(),
  admin: new Set(),
};
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
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  //Обработчик регистрации
  socket.on('register', (data) => {
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
  });
  //Обработчик сообщения
  socket.on('message', (message) => {
    io.emit('message', message);
  });
  //Обработчик уведомления
  socket.on('notification', (data) => {
    console.log('Получено событие notification на сервере. Данные:', data);
    if ('roles' in data) {
      const { roles, notification } = data;
      console.log('Broadcasting notification for roles:', roles);
      roles.forEach((role) => {
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
      const { userId, notification } = data;
      console.log('Индивидуальное уведомление для userId:', userId);
      const targetSocketId = users[userId]?.socketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId}`);
      } else {
        console.log(`User ${userId} not found`);
      }
    }
  });
  //Обработчик отключения
  socket.on('disconnect', () => {
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
  });
});
server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
export { io, users, usersByRole };
//# sourceMappingURL=server.js.map
