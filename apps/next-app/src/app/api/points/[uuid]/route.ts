import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const log = debug('app:api:points:uuid');

export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    //Await the params to resolve it before using it
    const { uuid } = await params;

    log('Fetching point with UUID:', uuid);

    const point = await prisma.point.findUnique({
      where: {
        uuid: uuid,
      },
    });

    if (!point) {
      log('Point not found with UUID:', uuid);
      return NextResponse.json({ error: 'Point not found' }, { status: 404 });
    }

    log('Fetched point:', point);

    return NextResponse.json({ data: { point } });
  } catch (error) {
    console.error(error);
    log('Error fetching point:', error);
    return NextResponse.json({ message: 'Ошибка при получении точки' }, { status: 500 });
  }
}
