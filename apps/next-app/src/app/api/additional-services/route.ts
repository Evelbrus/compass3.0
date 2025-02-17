import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import { AdditionalService } from '@prisma/client';

const log = debug('app:additional-services');

//POST запрос для создания новой опции услуги
export async function POST(req: Request) {
  try {
    const data: AdditionalService = await req.json();
    const { name } = data;

    //Валидация данных
    if (!name) {
      return NextResponse.json(
        { status: 'error', message: 'Название услуги обязательно' },
        { status: 400 },
      );
    }

    log('Received data:', data);

    const now = new Date();
    const uuid = uuidv4();

    const additionalService = {
      uuid,
      name,
      createdAt: now,
      updatedAt: now,
    };

    const createdAdditionalService = await prisma.additionalService.create({
      data: additionalService,
    });

    log('Created additional service:', createdAdditionalService);

    return NextResponse.json(createdAdditionalService);
  } catch (error) {
    log('Error creating additional service:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create additional service' }, { status: 500 });
  }
}

//GET запрос для получения всех опций услуги с пагинацией
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    search: searchParams.get('search') || null,
    sort_by: (searchParams.get('sort_by') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    //Фильтрация и сортировка данных
    const where: { name?: { contains: string; mode: 'insensitive' } } = {};
    if (parsedParams.search) {
      where.name = { contains: parsedParams.search, mode: 'insensitive' };
    }

    const additionalServices = await prisma.additionalService.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
    });

    const total = await prisma.additionalService.count({ where });

    log('Fetched additional services:', additionalServices);

    return NextResponse.json({
      status: 'success',
      message: 'Fetched additional services successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        additionalServices,
      },
    });
  } catch (error) {
    log('Error fetching additional services:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch additional services' }, { status: 500 });
  }
}
