import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { Params } from '@next-app/src/interface/interface';
import { markNotificationAsRead } from '@next-app/src/services/notifications/notificationService';

const log = debug('app:api:notifications');

//PUT /api/notifications/[uuid] - Обновить уведомление (например, пометить как прочитанное)
export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid: notificationUuid } = await params;
  log(`Received PUT request to update notification with UUID: ${notificationUuid}`);

  const data = await req.json();
  const { read } = data;

  try {
    // Используем нашу новую функцию для пометки уведомления как прочитанное
    const updatedNotification = await markNotificationAsRead(notificationUuid, read);

    if (!updatedNotification) {
      log(`Notification with UUID: ${notificationUuid} not found`);
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    log(`Successfully updated notification with UUID: ${notificationUuid}`);
    return NextResponse.json(updatedNotification);
  } catch (error) {
    log(`Error updating notification ${notificationUuid}:`, error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid: notificationUuid } = await params;
  log(`Received PATCH request to update notification with UUID: ${notificationUuid}`);

  let data: { read?: boolean; action?: 'success' | 'cancelled' };
  try {
    data = await req.json();
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { read, action } = data;

  if (action !== undefined && !['success', 'cancelled'].includes(action)) {
    log('action property must be "success" or "cancelled"');
    return NextResponse.json(
      { error: 'action property must be "success" or "cancelled"' },
      { status: 400 },
    );
  }

  try {
    // Получаем текущее уведомление для проверки
    const notification = await prisma.notification.findUnique({
      where: { uuid: notificationUuid },
    });

    if (!notification) {
      log(`Notification with UUID: ${notificationUuid} not found`);
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Если только read изменяется, используем нашу новую функцию
    if (read !== undefined && action === undefined) {
      const updatedNotification = await markNotificationAsRead(notificationUuid, read);
      return NextResponse.json(updatedNotification);
    }

    // Если изменяется action или оба параметра, используем стандартное обновление + markNotificationAsRead
    const updatedData: any = {};
    if (action !== undefined) {
      updatedData.action = action;
    }

    // Обновляем action, если он изменяется
    if (Object.keys(updatedData).length > 0) {
      await prisma.notification.update({
        where: { uuid: notificationUuid },
        data: updatedData,
      });
    }

    // Если read тоже изменяется, используем markNotificationAsRead для обновления через WebSocket
    if (read !== undefined) {
      const updatedNotification = await markNotificationAsRead(notificationUuid, read);
      return NextResponse.json(updatedNotification);
    }

    // Если только action изменялся, получаем обновленное уведомление для ответа
    const finalNotification = await prisma.notification.findUnique({
      where: { uuid: notificationUuid },
    });

    log(`Successfully updated notification with UUID: ${notificationUuid}`);
    return NextResponse.json(finalNotification);
  } catch (error) {
    log('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

//DELETE /api/notifications/[uuid] - Удалить уведомление
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { uuid: notificationUuid } = await params;
  log(`Received DELETE request for notification with UUID: ${notificationUuid}`);

  try {
    const deletedNotification = await prisma.notification.delete({
      where: { uuid: notificationUuid },
    });

    log(`Successfully deleted notification with UUID: ${notificationUuid}`);
    return NextResponse.json(deletedNotification);
  } catch (error) {
    console.error('Error deleting notification:', error);
    log('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
