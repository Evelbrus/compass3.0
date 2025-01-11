import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import debug from 'debug';
import { CreatePointData } from '@shared/prisma/interface/point/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:points');
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

//GET запрос для получения всех точек с пагинацией и сортировкой
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    sort_by:
      (searchParams.get('sort_by') as 'address' | 'basePrice' | 'createdAt' | 'updatedAt') ||
      'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    const points = await prisma.point.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
    });

    const total = await prisma.point.count();

    log('Fetched points:', points);

    return NextResponse.json({
      status: 'success',
      message: 'Fetched point successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        points,
      },
    });
  } catch (error) {
    log('Error fetching points:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch points' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

//POST запрос для создания новой точки
export async function POST(req: Request) {
  try {
    const data: CreatePointData = await req.json();
    const { address, basePrice } = data;

    log('Received data:', data);

    const now = new Date();
    const uuid = uuidv4();

    const point = {
      uuid,
      address,
      basePrice,
      createdAt: now,
      updatedAt: now,
    };

    const createdPoint = await prisma.point.create({
      data: point,
    });

    log('Created point:', createdPoint);

    return NextResponse.json(createdPoint);
  } catch (error) {
    log('Error creating point:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create point' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
