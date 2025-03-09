import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { DriverAcceptanceStatus, OrderStatus, Action, UserRole } from '@prisma/client';
import {
  processNotification,
  processBulkNotifications,
} from '@next-app/src/utils/notifications/notifications';
import { Params } from '@next-app/src/interface/interface';

const log = debug('app:orders:update-admin-status');

interface UpdateAdminOrderRequest {
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
  log(`Обновление статуса для заказа UUID: ${uuid} администратором`);

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
    }: UpdateAdminOrderRequest = await req.json();

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

      const admin = await prismaTx.user.findUnique({ where: { uuid: userId } });
      if (!admin || admin.role !== UserRole.Admin) {
        throw new Error('Пользователь не найден или не является администратором');
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

    // Логика уведомлений для действий администратора
    if (orderStatus === OrderStatus.CANCELLED) {
      // Уведомление клиенту
      await processNotification({
        userId: updatedOrder.createdById, // Клиент
        orderId: updatedOrder.uuid,
        action: Action.cancelled,
        templateKey: 'orderCancelledByAdminToClient',
        createdById,
      });

      // Уведомление водителю, если он назначен
      if (updatedOrder.assignedDriverId) {
        await processNotification({
          userId: updatedOrder.assignedDriverId, // Водитель
          orderId: updatedOrder.uuid,
          action: Action.cancelled,
          templateKey: 'orderCancelledByAdminToDriver',
          createdById,
          driverById: updatedOrder.assignedDriverId,
        });
      }

      // Уведомление другим админам и операторам
      const otherAdminsAndOperators = await prisma.user.findMany({
        where: {
          role: { in: [UserRole.Admin, UserRole.Operator] },
          uuid: { not: userId }, // Не отправляем уведомление самому администратору
        },
        select: { uuid: true, role: true },
      });

      if (otherAdminsAndOperators.length > 0) {
        await processBulkNotifications({
          users: otherAdminsAndOperators,
          orderId: updatedOrder.uuid,
          action: Action.info,
          templateKey: 'orderCancelledByAdminToOtherAdmins',
          createdById,
          driverById: updatedOrder.assignedDriverId || null,
        });
      }
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
      }
    }

    const updatedData = { updatedOrder };
    log(`Заказ ${uuid} успешно обновлён администратором:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error: unknown) {
    log('Ошибка при обновлении статуса заказа администратором:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
