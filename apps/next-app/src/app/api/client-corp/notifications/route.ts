//route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:api:client-corp/notifications');

export async function POST(request: NextRequest) {
  log('Received POST request to /api/client-corp/notifications');
  try {
    const body = await request.json();
    log('Request body:', body);

    if (body.roles && Array.isArray(body.roles) && body.roles.length > 0) {
      const { roles, title, message } = body;
      if (!title || !message) {
        log('Missing required fields (title, message) for broadcast notifications');
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const users = await prisma.user.findMany({
        where: { role: { in: roles } },
        select: { uuid: true },
      });
      if (!users.length) {
        log('No users found for roles:', roles);
        return NextResponse.json({ error: 'No users found for specified roles' }, { status: 404 });
      }
      const notificationsData = users.map((user) => ({
        uuid: uuidv4(),
        userId: user.uuid,
        title,
        message,
      }));
      const notifications = await prisma.notification.createMany({
        data: notificationsData,
      });
      log(
        'Successfully created notifications for users:',
        users.map((u) => u.uuid),
      );
      return NextResponse.json({ created: notifications.count }, { status: 201 });
    } else if (body.userId) {
      const { userId, title, message } = body;
      if (!title || !message) {
        log('Missing required fields (title, message) for single notification');
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          title,
          message,
        },
      });
      log('Successfully created notification for user:', userId);
      return NextResponse.json(notification, { status: 201 });
    } else {
      log('Missing required fields: either roles or userId must be provided');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    log('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
