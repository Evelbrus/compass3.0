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
if (process.env.SSL_KEY_PATH &&
    process.env.SSL_CERT_PATH &&
    fs.existsSync(path.resolve(process.env.SSL_KEY_PATH)) &&
    fs.existsSync(path.resolve(process.env.SSL_CERT_PATH))) {
    const sslOptions = {
        key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
        cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH)),
    };
    server = createHttpsServer(sslOptions);
    console.log('Using HTTPS server');
}
else {
    //Если ключи не заданы или файлы не найдены – запускаем HTTP-сервер
    server = createHttpServer();
    console.log('Using HTTP server');
}
const users = {};
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
    socket.on('hello', (value) => {
        console.log('HELLO', value);
    });
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} registered with socket id ${socket.id}`);
    });
    socket.on('message', (message) => {
        io.emit('message', message);
    });
    socket.on('notification', (data) => {
        const { userId, notification } = data;
        const targetSocketId = users[userId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('notification', notification);
            console.log(`Notification sent to user ${userId}`);
        }
        else {
            console.log(`User ${userId} not found`);
        }
    });
    socket.on('driverOrderNotification', (data) => {
        const { userId, notification } = data;
        const targetSocketId = users[userId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('driverOrderNotification', notification);
            console.log(`Driver Order Notification sent to user ${userId}`);
        }
        else {
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
server.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
});
export { io, users };
//# sourceMappingURL=server.js.map