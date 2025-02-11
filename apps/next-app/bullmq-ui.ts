//dashboard.js
import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

//Создаём очередь, которую будем мониторить
const orderQueue = new Queue('orderQueue', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },
});

//Настраиваем адаптер для express
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

//Создаём Bull Board
createBullBoard({
  queues: [new BullMQAdapter(orderQueue)],
  serverAdapter: serverAdapter,
});

//Подключаем роутер дашборда к express
app.use('/admin/queues', serverAdapter.getRouter());

//Запускаем сервер
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`BullMQ Dashboard запущен на http://localhost:${port}/admin/queues`);
});
