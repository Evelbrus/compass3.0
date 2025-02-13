import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();
const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};
export const orderQueue = new Queue('orderQueue', {
    connection: redisOptions,
});
console.log('Очередь orderQueue создана.');
//# sourceMappingURL=orderQueue.js.map