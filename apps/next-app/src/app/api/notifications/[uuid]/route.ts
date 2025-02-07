//app/api/notifications/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:api:notifications');

interface Params {
  uuid: string;
}

//PUT /api/notifications/[uuid] - Обновить уведомление (например, пометить как прочитанное)
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const notificationUuid = params.uuid;
  log(`Received PUT request to update notification with UUID: ${notificationUuid}`);

  //try {
  const data = await req.json();
  const { read } = data;

  log(`Marking notification ${notificationUuid} as read: ${read}`);

  const updatedNotification = await prisma.notification.update({
    where: {
      uuid: notificationUuid,
    },
    data: {
      read: read,
    },
  });

  log(`Successfully updated notification with UUID: ${notificationUuid}`);
  return NextResponse.json(updatedNotification);

  //} catch (error: any) {
  //console.error('Error updating notification:', error);
  //log('Error updating notification:', error);
  //return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  //}
}

//DELETE /api/notifications/[uuid] - Удалить уведомление
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const notificationUuid = params.uuid;
  log(`Received DELETE request for notification with UUID: ${notificationUuid}`);

  try {
    const deletedNotification = await prisma.notification.delete({
      where: {
        uuid: notificationUuid,
      },
    });

    log(`Successfully deleted notification with UUID: ${notificationUuid}`);
    return NextResponse.json(deletedNotification);
  } catch (error) {
    console.error('Error deleting notification:', error);
    log('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
