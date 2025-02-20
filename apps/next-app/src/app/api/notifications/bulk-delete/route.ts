//pages/api/notifications/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:api:notifications');

//GET /api/notifications?userId=... - Получить уведомления пользователя
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    log('Error: userId is required');
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    log(`Successfully fetched notifications for user ${userId}`);
    return NextResponse.json(notifications);
  } catch (error) {
    log('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

//POST /api/notifications/bulk-delete - Массовое удаление уведомлений
export async function POST(req: NextRequest) {
  log('Received POST request for bulk deletion of notifications');

  let data: { notificationIds: string[] };
  try {
    data = await req.json();
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { notificationIds } = data;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    log('Error: notificationIds must be a non-empty array');
    return NextResponse.json(
      { error: 'notificationIds must be a non-empty array' },
      { status: 400 },
    );
  }

  try {
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        uuid: {
          in: notificationIds,
        },
      },
    });

    log(`Successfully deleted ${deletedNotifications.count} notifications`);
    return NextResponse.json({ deletedCount: deletedNotifications.count });
  } catch (error) {
    log('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
