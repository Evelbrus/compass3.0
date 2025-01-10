import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import debug from 'debug';

const log = debug('app:orders');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface Params {
  uuid: string;
}

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

  if (!uuid) {
    return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    log('Fetched order:', order);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    log('Error fetching order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch order' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

  if (!uuid) {
    return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
  }

  let data;
  try {
    data = await req.json();
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { uuid },
      data: {
        createdById: data.createdById,
        tariffUuid: data.tariffUuid,
        departurePointId: data.departurePointId,
        arrivalPointId: data.arrivalPointId,
        assignedDriverId: data.assignedDriverId,
        status: data.status,
        basePrice: data.basePrice,
        finalPrice: data.finalPrice,
        departureTime: new Date(data.departureTime),
      },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: {
          include: {
            user: true,
          },
        },
      },
    });

    log('Updated order:', updatedOrder);
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    log('Error updating order:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
