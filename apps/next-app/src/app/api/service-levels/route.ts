import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';
import { CreateServiceLevelData } from '@shared/prisma/interface/service-levels/interface';

const log = debug('app:service-levels');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

//POST запрос для создания нового уровня обслуживания
export async function POST(req: Request) {
  try {
    const data: CreateServiceLevelData = await req.json();
    const { name, serviceType, price } = data;

    log('Received data:', data);

    const now = new Date();
    const uuid = uuidv4();

    const serviceLevel = {
      uuid,
      name,
      serviceType,
      price,
      createdAt: now,
      updatedAt: now,
    };

    const createdServiceLevel = await prisma.serviceLevel.create({
      data: serviceLevel,
    });

    log('Created service level:', createdServiceLevel);

    return NextResponse.json(createdServiceLevel);
  } catch (error) {
    log('Error creating service level:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create service level' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

//GET запрос для получения всех уровней обслуживания с пагинацией
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    sort_by:
      (searchParams.get('sort_by') as 'name' | 'price' | 'createdAt' | 'updatedAt') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    const serviceLevels = await prisma.serviceLevel.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
    });

    const total = await prisma.serviceLevel.count();

    log('Fetched service levels:', serviceLevels);

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      serviceLevels,
    });
  } catch (error) {
    log('Error fetching service levels:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch service levels' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
