import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

//Обновлённый интерфейс для хранения информации о пользователе
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
  //При необходимости можно добавить другие роли, например:
  //client: new Set(),
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

io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);

  socket.on('hello', (value: any) => {
    console.log('HELLO', value);
  });

  //Обработчик регистрации с передачей роли
  socket.on('register', (data: { userId: string; role?: string }) => {
    if (!data.role) {
      console.warn(`Регистрация пользователя ${data.userId} без роли`);
      //Можно назначить роль по умолчанию или просто выйти из функции
      return;
    }
    //Приводим роль к нижнему регистру для единообразия
    const role = data.role.toLowerCase();
    users[data.userId] = { socketId: socket.id, role };

    //Добавляем userId в нужную группу
    if (usersByRole[role]) {
      usersByRole[role].add(data.userId);
    } else {
      //Если для данной роли ещё не создан набор, создаём его
      usersByRole[role] = new Set([data.userId]);
    }

    console.log(`User ${data.userId} with role ${role} registered with socket id ${socket.id}`);
  });

  socket.on('message', (message: any) => {
    io.emit('message', message);
  });

  socket.on('notification', (data: any) => {
    console.log('Получено событие notification на сервере. Данные:', data);
    if (data.roles) {
      //Обработка broadcast-уведомлений
      const { roles, notification } = data;
      console.log('Broadcasting notification for roles:', roles);

      //Для каждой указанной роли отправляем уведомление
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
      //Обработка индивидуального уведомления
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

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    //При отключении удаляем пользователя из users и группы по ролям
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
