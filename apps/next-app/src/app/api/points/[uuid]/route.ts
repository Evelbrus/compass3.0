import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const log = debug('app:api:points:uuid');

//📌 GET: Получение точки прибытия по UUID
export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;

    log('🔍 Получаем точку прибытия с UUID:', uuid);

    const point = await prisma.point.findUnique({
      where: { uuid },
    });

    if (!point) {
      log('❌ Точка прибытия не найдена:', uuid);
      return NextResponse.json({ error: 'Точка прибытия не найдена' }, { status: 404 });
    }

    log('✅ Найдена точка прибытия:', point);

    return NextResponse.json({ data: point });
  } catch (error) {
    log('❌ Ошибка при получении точки прибытия:', error);
    return NextResponse.json({ message: 'Ошибка при получении точки прибытия' }, { status: 500 });
  }
}

//📌 PUT: Обновление точки прибытия по UUID
export async function PUT(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    const { address, basePrice } = await req.json();

    if (!address || basePrice === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Адрес и базовая цена обязательны' },
        { status: 400 },
      );
    }

    const updatedPoint = await prisma.point.update({
      where: { uuid },
      data: { address, basePrice: Number(basePrice), updatedAt: new Date() },
    });

    log(`✅ Точка прибытия ${uuid} обновлена:`, updatedPoint);

    return NextResponse.json(updatedPoint);
  } catch (error) {
    log('❌ Ошибка при обновлении точки прибытия:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении точки прибытия' }, { status: 500 });
  }
}

//📌 DELETE: Удаление точки прибытия по UUID
export async function DELETE(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;

    log('🗑️ Удаляем точку прибытия с UUID:', uuid);

    //Проверяем, существует ли точка
    const existingPoint = await prisma.point.findUnique({
      where: { uuid },
    });

    if (!existingPoint) {
      return NextResponse.json(
        { status: 'error', message: 'Точка прибытия не найдена' },
        { status: 404 },
      );
    }

    await prisma.point.delete({
      where: { uuid },
    });

    log(`✅ Точка прибытия ${uuid} успешно удалена`);

    return NextResponse.json({ status: 'success', message: 'Точка прибытия удалена' });
  } catch (error) {
    log('❌ Ошибка при удалении точки прибытия:', error);
    return NextResponse.json({ error: 'Ошибка при удалении точки прибытия' }, { status: 500 });
  }
}
