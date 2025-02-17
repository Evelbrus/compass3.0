import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

//Логгер для дебага
const log = debug('app:additional-services');

export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    log(`🔍 Получаем услугу по UUID: ${uuid}`);

    const service = await prisma.additionalService.findUnique({
      where: { uuid },
    });

    if (!service) {
      return NextResponse.json({ status: 'error', message: 'Услуга не найдена' }, { status: 404 });
    }

    log(`✅ Найдена услуга:`, service);
    return NextResponse.json(service);
  } catch (error) {
    log('❌ Ошибка при получении услуги:', error);
    return NextResponse.json({ error: 'Ошибка при получении услуги' }, { status: 500 });
  }
}

//📌 PUT: Обновление услуги по UUID
export async function PUT(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { status: 'error', message: 'Название услуги обязательно' },
        { status: 400 },
      );
    }

    const updatedService = await prisma.additionalService.update({
      where: { uuid },
      data: { name, updatedAt: new Date() },
    });

    log(`✅ Услуга ${uuid} обновлена:`, updatedService);

    return NextResponse.json(updatedService);
  } catch (error) {
    log('❌ Ошибка при обновлении услуги:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении услуги' }, { status: 500 });
  }
}

//📌 DELETE: Удаление услуги по UUID
export async function DELETE(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;

    log(`🗑️ Удаляем услугу с UUID: ${uuid}`);

    //Проверяем, существует ли услуга
    const existingService = await prisma.additionalService.findUnique({
      where: { uuid },
    });

    if (!existingService) {
      return NextResponse.json({ status: 'error', message: 'Услуга не найдена' }, { status: 404 });
    }

    await prisma.additionalService.delete({
      where: { uuid },
    });

    log(`✅ Услуга ${uuid} успешно удалена`);

    return NextResponse.json({ status: 'success', message: 'Услуга удалена' });
  } catch (error) {
    log('❌ Ошибка при удалении услуги:', error);
    return NextResponse.json({ error: 'Ошибка при удалении услуги' }, { status: 500 });
  }
}
