// app/src/services/orders/deleteOrder.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:orders:error');

interface OrderInfo {
  uuid: string;
  createdById: string;
  assignedDriverId: string | null;
  departurePointId: string;
  arrivalPointId: string;
}

export async function deleteOrder(uuid: string): Promise<OrderInfo | null> {
  try {
    if (!uuid) {
      logError('× UUID заказа отсутствует');
      throw new Error('Order UUID is required');
    }

    // Получаем данные заказа до удаления
    const order = await prisma.order.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        createdById: true,
        assignedDriverId: true,
        departurePointId: true,
        arrivalPointId: true,
      },
    });

    if (!order) {
      logError(`× Заказ с UUID ${uuid} не найден`);
      throw new Error('Order not found');
    }

    // Удаляем заказ
    await prisma.order.delete({ where: { uuid } });

    return order;
  } catch (error) {
    logError('× Ошибка при удалении заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
