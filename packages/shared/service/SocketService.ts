import { Server, Socket } from 'socket.io';

interface NotificationData {
  userId: string;
  title: string;
  message: string;
}

class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private users: Map<string, string> = new Map();

  private constructor() {
    //Private constructor for singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  setIo(io: Server) {
    this.io = io;

    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected', socket.id);

      socket.on('hello', (value) => {
        console.log('HELLO', value);
      });

      socket.on('register', (userId) => {
        this.users.set(userId, socket.id);
        console.log(`User ${userId} registered with socket id ${socket.id}`);
      });

      socket.on('message', (message) => {
        this.io?.emit('message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        for (let [userId, socketId] of this.users.entries()) {
          if (socketId === socket.id) {
            this.users.delete(userId);
            break;
          }
        }
      });
    });
  }

  public sendNotificationToUser(userId: string, notificationData: NotificationData): boolean {
    const targetSocketId = this.users.get(userId);
    if (targetSocketId && this.io) {
      this.io.to(targetSocketId).emit('notification', notificationData);
      console.log(`Уведомление отправлено пользователю ${userId}`);
      return true;
    } else {
      console.log(`Пользователь ${userId} не в сети`);
      return false;
    }
  }
}

export default SocketService;
