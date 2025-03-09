import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:api:orders:clients:[uuid]');

export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    log(`Fetched client with UUID: ${uuid}`);

    return NextResponse.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    log(`Error fetching client with UUID: ${uuid}`, error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch client' }, { status: 500 });
  }
}
