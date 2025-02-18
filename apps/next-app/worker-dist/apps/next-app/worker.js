//worker.ts
import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { prisma } from '../../packages/shared/prisma/prisma-client.js';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Action, OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import { orderQueue } from './src/lib/queues/orderQueue.js';
dotenv.config();
const redisOptions = {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
};
const socket = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN || 'http://localhost:3008', {
    transports: ['websocket'],
    path: '/socket.io',
    autoConnect: true,
});
socket.on('connect', () => console.log('✅ Подключено к серверу сокетов'));
socket.on('disconnect', () => console.log('❌ Отключено от сервера сокетов'));
/**
 * Воркер для очереди orderQueue.
 * Обрабатывает две задачи:
 *  - "notification" — отправка уведомления со статусом inProgress (за 1 минуту до departureTime);
 *  - "checkoverdue" — в момент наступления departureTime проверяет, если заказ всё ещё в статусе PENDING/PLANNED,
 *    обновляет его до OVERDUE и, если водитель назначен, обновляет его статус на TIMEOUT и отправляет уведомление warning.
 */
export const worker = new Worker('orderQueue', async (job) => {
    try {
        console.log(`🚀 Начало обработки задачи "${job.name}" с ID ${job.id}`);
        if (job.name.toLowerCase() === 'notification') {
            await processNotificationJob(job);
        }
        else if (job.name.toLowerCase() === 'checkoverdue') {
            await processCheckoverdueJob(job);
        }
        else {
            console.warn(`⚠️ Неизвестная задача: ${job.name}`);
        }
        console.log(`✅ Задача "${job.name}" с ID ${job.id} успешно выполнена.`);
    }
    catch (error) {
        console.error(`❌ Ошибка при выполнении задачи "${job.name}":`, error);
        throw error;
    }
}, { connection: redisOptions });
worker.on('completed', (job) => console.log(`✅ Задача ${job.id} ("${job.name}") выполнена`));
//Обработчик события failed с корректной сигнатурой: (job, error, prev)
worker.on('failed', (job, err, prev) => {
    if (job) {
        console.error(`❌ Ошибка в задаче ${job.id} ("${job.name}"): ${err.message}`);
    }
    else {
        console.error(`❌ Ошибка: ${err.message}`);
    }
});
/**
 * Задача "notification":
 *  - За 1 минуту до departureTime отправляется уведомление со статусом inProgress.
 *  - Если водитель назначен, уведомление отправляется водителю и после этого планируется задача "checkoverdue".
 *  - Если водитель не назначен, уведомление не отправляется, но задача "checkoverdue" всё равно планируется.
 */
async function processNotificationJob(job) {
    const order = job.data.order;
    console.log(`Отправка уведомления inProgress для заказа ${order.uuid}`);
    //Если водитель назначен, отправляем уведомление inProgress
    if (order.assignedDriverId) {
        await prisma.$transaction(async (prismaTx) => {
            const newMessage = `Вам назначен новый заказ от ${order.departurePoint?.address || 'неизвестного места'}.`;
            const desiredAction = Action.inProgress;
            let notification = await prismaTx.notification.findFirst({
                where: { orderId: order.uuid, userId: order.assignedDriverId },
            });
            if (notification) {
                notification = await prismaTx.notification.update({
                    where: { uuid: notification.uuid },
                    data: { action: desiredAction, message: newMessage },
                });
                console.log(`✅ Уведомление для заказа ${order.uuid} обновлено статусом ${desiredAction}`);
            }
            else {
                notification = await prismaTx.notification.create({
                    data: {
                        uuid: uuidv4(),
                        userId: order.assignedDriverId,
                        orderId: order.uuid,
                        title: 'Новый заказ!',
                        message: newMessage,
                        action: desiredAction,
                    },
                });
                console.log(`✅ Уведомление для заказа ${order.uuid} создано со статусом ${desiredAction}`);
            }
            const notificationData = {
                uuid: notification.uuid,
                orderId: order.uuid,
                title: notification.title,
                message: notification.message,
                read: notification.read,
                createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
                action: notification.action,
            };
            socket.emit('notification', {
                userId: order.assignedDriverId,
                notification: notificationData,
            });
            console.log('📡 Уведомление inProgress отправлено через сокет:', notificationData);
        });
    }
    else {
        console.warn(`Заказ ${order.uuid} не имеет назначенного водителя — уведомление inProgress не отправляется.`);
    }
    //Планируем задачу "checkoverdue" в момент departureTime (независимо от наличия водителя)
    const departureTimeMs = new Date(order.departureTime).getTime();
    const now = Date.now();
    const delay = Math.max(departureTimeMs - now, 0);
    await orderQueue.add('checkoverdue', { order }, {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        jobId: `checkoverdue-${order.uuid}`,
    });
    console.log(`⏱ Задача "checkoverdue" для заказа ${order.uuid} запланирована через ${delay} мс.`);
}
/**
 * Задача "checkoverdue":
 *  - В момент наступления departureTime проверяет, если заказ всё ещё в состоянии PENDING или PLANNED,
 *    то обновляет его до OVERDUE.
 *  - Если водитель назначен, дополнительно обновляет его статус на TIMEOUT и отправляет уведомление со статусом warning.
 */
async function processCheckoverdueJob(job) {
    const order = job.data.order;
    console.log(`Проверка просроченности заказа ${order.uuid} в момент departureTime`);
    const freshOrder = await prisma.order.findUnique({ where: { uuid: order.uuid } });
    if (!freshOrder) {
        console.error(`Заказ ${order.uuid} не найден в базе данных`);
        return;
    }
    //Только если время departureTime прошло и заказ ещё PENDING/PLANNED – обновляем статус
    if (freshOrder.status === OrderStatus.PENDING || freshOrder.status === OrderStatus.PLANNED) {
        await prisma.order.update({
            where: { uuid: order.uuid },
            data: { status: OrderStatus.OVERDUE },
        });
        console.log(`✅ Статус заказа ${order.uuid} обновлен на OVERDUE`);
        //Если водитель назначен, дополнительно обновляем его статус и отправляем уведомление warning
        if (order.assignedDriverId) {
            await prisma.user.update({
                where: { uuid: order.assignedDriverId },
                data: { driverAcceptanceStatus: DriverAcceptanceStatus.TIMEOUT },
            });
            console.log(`✅ Статус водителя для заказа ${order.uuid} обновлен на TIMEOUT`);
            const warningMessage = `Заказ от ${order.departurePoint?.address || 'неизвестного места'} просрочен.`;
            let notification = await prisma.notification.findFirst({
                where: { orderId: order.uuid, userId: order.assignedDriverId },
            });
            if (notification) {
                if (notification.action !== Action.warning) {
                    notification = await prisma.notification.update({
                        where: { uuid: notification.uuid },
                        data: { action: Action.warning, message: warningMessage },
                    });
                    console.log(`✅ Уведомление для заказа ${order.uuid} обновлено до статуса ${Action.warning}`);
                }
                else {
                    console.log(`ℹ️ Уведомление для заказа ${order.uuid} уже имеет статус ${Action.warning}`);
                }
            }
            else {
                notification = await prisma.notification.create({
                    data: {
                        uuid: uuidv4(),
                        userId: order.assignedDriverId,
                        orderId: order.uuid,
                        title: 'Просроченный заказ',
                        message: warningMessage,
                        action: Action.warning,
                    },
                });
                console.log(`✅ Создано новое уведомление для просроченного заказа ${order.uuid}`);
            }
            const notificationData = {
                uuid: notification.uuid,
                orderId: order.uuid,
                title: notification.title,
                message: notification.message,
                read: notification.read,
                createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
                action: notification.action,
            };
            socket.emit('notification', {
                userId: order.assignedDriverId,
                notification: notificationData,
            });
            console.log('📡 Уведомление warning отправлено через сокет:', notificationData);
        }
        else {
            console.log(`ℹ️ Для заказа ${order.uuid} водитель не назначен — обновление статуса происходит без уведомления водителя.`);
        }
    }
    else {
        console.log(`ℹ️ Заказ ${order.uuid} имеет статус ${freshOrder.status}, обновление до OVERDUE не требуется`);
    }
}
//# sourceMappingURL=worker.js.map