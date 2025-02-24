import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { DriverAcceptanceStatus, OrderStatus, Action, UserRole } from '@prisma/client';
import {
  processNotification,
  processBulkNotifications,
} from '@next-app/src/utils/notifications/notifications';
import { Params } from '@next-app/src/interface/interface';

const log = debug('app:orders:update-client-status');

interface UpdateClientOrderRequest {
  orderUuid: string;
  driverStatus?: DriverAcceptanceStatus;
  orderStatus?: OrderStatus;
  notificationUuid: string;
  userId: string;
  createdById: string;
  driverById?: string;
  markNotificationAsRead?: boolean;
  action: Action;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Обновление статуса для заказа UUID: ${uuid} клиентом`);

  try {
    const {
      driverStatus,
      orderStatus,
      userId,
      createdById,
      notificationUuid,
      driverById,
      markNotificationAsRead,
      action,
    }: UpdateClientOrderRequest = await req.json();

    log(`Полученные данные:`, {
      driverStatus: driverStatus ?? 'null',
      orderStatus: orderStatus ?? 'null',
      userId,
      createdById,
      notificationUuid,
      driverById: driverById ?? 'null',
      markNotificationAsRead: markNotificationAsRead ?? 'null',
      action,
    });

    if (!userId || !createdById || !notificationUuid || !action) {
      log(`Отсутствуют обязательные поля`);
      return NextResponse.json(
        {
          error: 'Отсутствуют обязательные поля: userId, createdById, notificationUuid или action',
        },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.$transaction(async (prismaTx) => {
      const order = await prismaTx.order.findUnique({ where: { uuid } });
      if (!order) {
        log(`Заказ с UUID ${uuid} не найден`);
        throw new Error('Заказ не найден');
      }

      const client = await prismaTx.user.findUnique({ where: { uuid: userId } });
      if (!client || client.role !== UserRole.ClientCorp) {
        console.log('userole', client);
        console.log('userId', userId);
        throw new Error('Клиент не найден или не является создателем заказа');
      }

      const updatedOrder = await prismaTx.order.update({
        where: { uuid },
        data: {
          ...(orderStatus && { status: orderStatus }),
          ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
        },
      });

      return updatedOrder;
    });

    // Логика уведомлений для действий клиента
    if (orderStatus === OrderStatus.CANCELLED) {
      // Уведомление клиенту
      await processNotification({
        userId, // Клиент
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderCancelledByCorpClientToClient',
        createdById,
      });

      // Уведомление водителю, если он назначен
      if (updatedOrder.assignedDriverId) {
        await processNotification({
          userId: updatedOrder.assignedDriverId, // Водитель
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByCorpClientToDriver',
          createdById,
          driverById: updatedOrder.assignedDriverId,
        });
      }

      // Уведомление админам и операторам
      const adminsAndOperators = await prisma.user.findMany({
        where: { role: { in: [UserRole.Admin, UserRole.Operator] } },
        select: { uuid: true, role: true },
      });
      await processBulkNotifications({
        users: adminsAndOperators,
        orderId: updatedOrder.uuid,
        action: Action.info,
        templateKey: 'orderCancelledByCorpClientToAdmins',
        createdById,
        driverById: updatedOrder.assignedDriverId || null,
      });
    }

    // Отметка уведомления как прочитанного
    if (markNotificationAsRead && action === Action.noted) {
      const notification = await prisma.notification.findUnique({
        where: { uuid: notificationUuid },
      });

      if (!notification) {
        log(`Уведомление с UUID ${notificationUuid} не найдено`);
        throw new Error('Уведомление не найдено');
      }

      if (notification.read) {
        log(`Уведомление ${notificationUuid} уже прочитано, пропускаем обновление`);
      } else {
        await prisma.notification.update({
          where: { uuid: notificationUuid },
          data: { read: true },
        });
        log(`Уведомление ${notificationUuid} помечено как прочитанное`);
        await processNotification({
          userId, // Только клиент
          orderId: uuid,
          action: Action.noted,
          templateKey: 'orderNotedByClient',
          createdById,
          markNotificationAsRead: true,
        });
      }
    }

    const updatedData = { updatedOrder };
    log(`Заказ ${uuid} успешно обновлён клиентом:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error: unknown) {
    log('Ошибка при обновлении статуса заказа клиентом:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
