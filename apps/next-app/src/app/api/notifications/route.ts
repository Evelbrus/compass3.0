import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:api:notifications');

//POST /api/notifications - Создать новое уведомление
export async function POST(request: NextRequest) {
  log('Received POST request to /api/notifications');
  try {
    const { userId, title, message } = await request.json();
    log('Request body:', { userId, title, message });

    if (!userId || !title || !message) {
      log('Missing required fields (userId, title, message)');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uuid = uuidv4();

    const notification = await prisma.notification.create({
      data: {
        uuid: uuid,
        userId,
        title,
        message,
      },
    });

    log('Successfully created notification in database:', notification);
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    log('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

//GET /api/notifications?userId=... - Получить все уведомления для пользователя
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
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    log(`Successfully fetched ${notifications.length} notifications for userId: ${userId}`);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    log('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
