import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3008;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const users = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on("hello", (value) => {
      console.log("HELLO", value);
    });

    // Сохранение socket.id с uid пользователя
    socket.on('register', (userId) => {
      users.set(userId, socket.id);
      console.log(`User ${userId} registered with socket id ${socket.id}`);
    });

    socket.on('message', (message) => {
      console.log(`Received message => ${message}`);
      io.emit('message', message);
    });

    socket.on('notification', (data) => {
      const { userId, notification } = data;
      const targetSocketId = users.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId} with socket id ${targetSocketId}`);
      } else {
        console.log(`User ${userId} not found`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
      // Удаление пользователя из хранилища при отключении
      for (let [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});