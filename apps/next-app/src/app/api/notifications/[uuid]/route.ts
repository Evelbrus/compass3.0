import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:api:notifications');

interface Params {
  uuid: string;
}

//PUT /api/notifications/[uuid] - Обновить уведомление (например, пометить как прочитанное)
export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  //Дожидаемся разрешения промиса params
  const { uuid: notificationUuid } = await params;
  log(`Received PUT request to update notification with UUID: ${notificationUuid}`);

  const data = await req.json();
  const { read } = data;

  log(`Marking notification ${notificationUuid} as read: ${read}`);

  const updatedNotification = await prisma.notification.update({
    where: { uuid: notificationUuid },
    data: { read },
  });

  log(`Successfully updated notification with UUID: ${notificationUuid}`);
  return NextResponse.json(updatedNotification);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  //Дожидаемся разрешения промиса params
  const { uuid: notificationUuid } = await params;
  log(`Received PATCH request to update notification with UUID: ${notificationUuid}`);

  //Извлекаем данные из запроса
  let data: { read?: boolean };
  try {
    data = await req.json();
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { read } = data;
  if (typeof read !== 'boolean') {
    log('read property must be a boolean');
    return NextResponse.json({ error: 'read property must be a boolean' }, { status: 400 });
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: { uuid: notificationUuid },
      data: { read },
    });

    log(`Successfully updated notification with UUID: ${notificationUuid}`);
    return NextResponse.json(updatedNotification);
  } catch (error) {
    log('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

//DELETE /api/notifications/[uuid] - Удалить уведомление
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  //Дожидаемся разрешения промиса params
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
