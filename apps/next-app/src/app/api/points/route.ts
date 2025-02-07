import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { Prisma } from '@prisma/client';
import debug from 'debug';

const log = debug('app:points');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '4';
  const sort_by = searchParams.get('sort_by') as
    | 'address'
    | 'basePrice'
    | 'createdAt'
    | 'updatedAt'
    | undefined;
  const sort_order = searchParams.get('sort_order') as 'asc' | 'desc' | undefined;

  const pageNumber = parseInt(page);
  const perPage = parseInt(per_page);

  const where: Prisma.PointWhereInput = {
    address: {
      startsWith: search,
      mode: 'insensitive',
    },
  };

  //Добавляем вторичный критерий сортировки
  const orderBy: Prisma.PointOrderByWithRelationInput[] = [];

  if (sort_by && sort_order) {
    orderBy.push({ [sort_by]: sort_order });
  } else {
    orderBy.push({ createdAt: 'asc' });
  }

  //Всегда добавляем сортировку по UUID для стабильности
  orderBy.push({ uuid: 'asc' });

  try {
    const [points, total] = await Promise.all([
      prisma.point.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * perPage,
        take: perPage,
      }),
      prisma.point.count({ where }),
    ]);

    //Единая структура ответа для всех страниц
    return NextResponse.json({
      data: {
        points,
        total,
        page: pageNumber,
        per_page: perPage,
      },
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ message: 'Ошибка при получении точек' }, { status: 500 });
  }
}
