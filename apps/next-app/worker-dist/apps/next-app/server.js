//socket-server.ts
import { createServer } from 'node:http';
import { Server } from 'socket.io';
const port = 4000;
const httpServer = createServer();
const users = {};
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3008',
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
    //Событие для уведомлений водителя
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
httpServer.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
});
console.log('WebSocket server started');
export { io, users };
//# sourceMappingURL=server.js.map