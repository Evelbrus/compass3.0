import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import debug from 'debug';
import { EditServiceLevelData } from '@shared/prisma/interface/service-levels/interface';

const log = debug('app:service-levels');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface Params {
  uuid: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { uuid } = params;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    log('Received UUID:', uuid);

    const serviceLevel = await prisma.serviceLevel.findUnique({
      where: { uuid },
    });

    if (!serviceLevel) {
      return NextResponse.json({ error: 'Service level not found' }, { status: 404 });
    }

    log('Fetched service level:', serviceLevel);

    return NextResponse.json(serviceLevel);
  } catch (error) {
    log('Error fetching service level:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch service level' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

//PUT запрос для обновления данных уровня обслуживания по UUID
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const { uuid } = params;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    const data: EditServiceLevelData = await req.json();
    log('Received data for update:', data);

    const now = new Date();
    const updatedServiceLevel = await prisma.serviceLevel.update({
      where: { uuid },
      data: {
        ...data,
        updatedAt: now,
      },
    });

    log('Updated service level:', updatedServiceLevel);

    return NextResponse.json(updatedServiceLevel);
  } catch (error) {
    log('Error updating service level:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update service level' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

//DELETE запрос для удаления уровня обслуживания по UUID
export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const { uuid } = params;

    if (!uuid) {
      return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
    }

    log('Received UUID for deletion:', uuid);

    //Удаление уровня обслуживания по UUID
    const deletedServiceLevel = await prisma.serviceLevel.delete({
      where: { uuid },
    });

    log('Deleted service level:', deletedServiceLevel);

    return NextResponse.json({ message: 'Service level deleted successfully' });
  } catch (error) {
    log('Error deleting service level:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to delete service level' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
