import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const log = debug('app:api:points:uuid');

export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;

    log('Fetching point with UUID:', uuid);

    const point = await prisma.point.findUnique({
      where: {
        uuid: uuid,
      },
    });

    if (!point) {
      log('Point not found with UUID:', uuid);
      return NextResponse.json({ error: 'Точка не найдена' }, { status: 404 });
    }

    log('Fetched point:', point);

    return NextResponse.json({ data: { point } });
  } catch (error) {
    console.error(error);
    log('Error fetching point:', error);
    return NextResponse.json({ message: 'Ошибка при получении точки' }, { status: 500 });
  }
}

//📌 PUT: Обновление точки по UUID
export async function PUT(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    const { address, pricePerKm, terrainDifficulty, latitude, longitude } = await req.json();

    if (
      !address ||
      pricePerKm === undefined ||
      terrainDifficulty === undefined ||
      !latitude ||
      !longitude
    ) {
      return NextResponse.json(
        { status: 'error', message: 'Все поля обязательны' },
        { status: 400 },
      );
    }

    const updatedPoint = await prisma.point.update({
      where: { uuid },
      data: {
        address,
        pricePerKm: Number(pricePerKm),
        terrainDifficulty: Number(terrainDifficulty),
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: new Date(),
      },
    });

    log(`✅ Точка ${uuid} обновлена:`, updatedPoint);

    return NextResponse.json(updatedPoint);
  } catch (error) {
    log('❌ Ошибка при обновлении точки:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении точки' }, { status: 500 });
  }
}

//📌 POST: Создание новой точки
export async function POST(req: Request) {
  try {
    const { address, pricePerKm, terrainDifficulty, latitude, longitude } = await req.json();

    if (
      !address ||
      pricePerKm === undefined ||
      terrainDifficulty === undefined ||
      !latitude ||
      !longitude
    ) {
      return NextResponse.json(
        { status: 'error', message: 'Все поля обязательны' },
        { status: 400 },
      );
    }

    const newPoint = await prisma.point.create({
      data: {
        address,
        pricePerKm: Number(pricePerKm),
        terrainDifficulty: Number(terrainDifficulty),
        airport: false,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    log(`✅ Новая точка создана:`, newPoint);

    return NextResponse.json(newPoint);
  } catch (error) {
    log('❌ Ошибка при создании точки:', error);
    return NextResponse.json({ error: 'Ошибка при создании точки' }, { status: 500 });
  }
}

//📌 DELETE: Удаление точки по UUID
export async function DELETE(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;

    log('🗑️ Удаляем точку с UUID:', uuid);

    //Проверяем, существует ли точка
    const existingPoint = await prisma.point.findUnique({
      where: { uuid },
    });

    if (!existingPoint) {
      return NextResponse.json({ status: 'error', message: 'Точка не найдена' }, { status: 404 });
    }

    await prisma.point.delete({
      where: { uuid },
    });

    log(`✅ Точка ${uuid} успешно удалена`);

    return NextResponse.json({ status: 'success', message: 'Точка удалена' });
  } catch (error) {
    log('❌ Ошибка при удалении точки:', error);
    return NextResponse.json({ error: 'Ошибка при удалении точки' }, { status: 500 });
  }
}
