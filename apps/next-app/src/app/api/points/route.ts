import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { Prisma } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:points');

//📌 GET-запрос для получения списка точек с фильтрацией, пагинацией и сортировкой
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '10';
  const sort_by = searchParams.get('sort_by') as
    | 'address'
    | 'basePrice'
    | 'createdAt'
    | 'updatedAt'
    | undefined;
  const sort_order = searchParams.get('sort_order') as 'asc' | 'desc' | undefined;

  const pageNumber = parseInt(page, 10);
  const perPage = parseInt(per_page, 10);

  //📌 Фильтрация по адресу (убрал name, так как его нет)
  const where: Prisma.PointWhereInput = search
    ? {
        address: { contains: search, mode: 'insensitive' },
      }
    : {};

  //📌 Валидация и создание сортировки
  const validSortFields = ['address', 'basePrice', 'createdAt', 'updatedAt'];
  const orderBy: Prisma.PointOrderByWithRelationInput[] = [];

  if (sort_by && validSortFields.includes(sort_by)) {
    orderBy.push({ [sort_by]: sort_order ?? 'asc' } as Prisma.PointOrderByWithRelationInput);
  } else {
    orderBy.push({ createdAt: 'asc' });
  }

  //Добавляем сортировку по UUID для стабильности
  orderBy.push({ uuid: 'asc' });

  try {
    const [points, total] = await Promise.all([
      prisma.point.findMany({
        where,
        orderBy: orderBy.length ? orderBy : undefined,
        skip: (pageNumber - 1) * perPage,
        take: perPage,
      }),
      prisma.point.count({ where }),
    ]);

    log('Fetched points:', points);

    return NextResponse.json({
      status: 'success',
      message: 'Fetched points successfully',
      data: {
        points,
        total,
        page: pageNumber,
        per_page: perPage,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при получении точек:', error);
    return NextResponse.json({ message: 'Ошибка при получении точек' }, { status: 500 });
  }
}

//📌 POST-запрос для создания новой точки
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { address, basePrice } = data;

    //📌 Валидация данных
    if (!address || basePrice === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Адрес и базовая цена обязательны' },
        { status: 400 },
      );
    }

    log('Received data:', data);

    const now = new Date();
    const uuid = uuidv4();

    const point = {
      uuid,
      address,
      basePrice: Number(basePrice),
      airport: false, //Всегда false
      createdAt: now,
      updatedAt: now,
    };

    const createdPoint = await prisma.point.create({
      data: point,
    });

    log('Created point:', createdPoint);

    return NextResponse.json(createdPoint);
  } catch (error) {
    console.error('❌ Ошибка при создании точки:', error);
    return NextResponse.json({ error: 'Ошибка при создании точки' }, { status: 500 });
  }
}
