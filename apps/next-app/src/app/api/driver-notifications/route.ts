//app/api/driver-notifications/unread/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  if (!driverId || typeof driverId !== 'string') {
    return NextResponse.json({ message: 'Не указан driverId' }, { status: 400 });
  }

  try {
    const notifications = await prisma.driverOrderNotification.findMany({
      where: {
        driverId: driverId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Ошибка при получении непрочитанных уведомлений:', error);
    return NextResponse.json({ message: 'Ошибка при получении уведомлений' }, { status: 500 });
  }
}
