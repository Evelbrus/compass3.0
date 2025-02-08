//app/api/driver-notifications/[uuid]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';

interface Params {
  uuid?: string;
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { uuid } = params;

  if (!uuid || typeof uuid !== 'string') {
    return NextResponse.json({ message: 'Не указан uuid' }, { status: 400 });
  }

  try {
    await prisma.driverOrderNotification.update({
      where: { uuid: uuid },
      data: { isRead: true },
    });
    return NextResponse.json({ message: 'Уведомление отмечено как прочитанное' });
  } catch (error) {
    console.error('Ошибка при отметке уведомления как прочитанного:', error);
    return NextResponse.json(
      { message: 'Ошибка при отметке уведомления как прочитанного' },
      { status: 500 },
    );
  }
}
