import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import { Action } from '@prisma/client';

const log = debug('app:api:notifications');

export async function POST(request: NextRequest) {
  log('Received POST request to /api/notifications');
  try {
    const body = await request.json();
    if (Array.isArray(body.userIds)) {
      const { userIds, title, message, orderId, action, createdById } = body;
      if (!userIds?.length || !title || !message || !orderId || !createdById) {
        log('Missing required fields for multiple notifications');
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const notificationsData = userIds.map((userId: string) => ({
        uuid: uuidv4(),
        userId,
        title,
        message,
        orderId,
        action: action ?? Action.info,
        createdById, //Добавляем createdById
      }));
      const notifications = await prisma.notification.createMany({
        data: notificationsData,
      });
      log('Successfully created notifications for users:', notifications);
      return NextResponse.json(notifications, { status: 201 });
    } else {
      const { userId, title, message, orderId, action, createdById } = body;
      if (!userId || !title || !message || !orderId || !createdById) {
        log('Missing required fields for single notification');
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          title,
          message,
          orderId,
          action: action ?? Action.info,
          createdById, //Добавляем createdById
        },
      });
      log('Successfully created notification in database:', notification);
      return NextResponse.json(notification, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    log('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  log('Received GET request to /api/notifications');
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    if (!userId) {
      log('Missing userId parameter');
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }
    log(`Fetching notifications for userId: ${userId}`);
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    log(`Successfully fetched ${notifications.length} notifications for userId: ${userId}`);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    log('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
