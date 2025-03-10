// app/api/notifications/route.ts

import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getUserNotifications } from '@next-app/src/services/notifications/notificationService';

// Логгер только для ошибок
const logError = debug('app:api:notifications:error');

/**
 * GET обработчик для получения уведомлений
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      logError('× Параметр userId не передан');
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Получаем уведомления пользователя
    const notifications = await getUserNotifications(userId);

    // Возвращаем результат
    return NextResponse.json(notifications);
  } catch (error) {
    logError('× Ошибка при получении уведомлений');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
