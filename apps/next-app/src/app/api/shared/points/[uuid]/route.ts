// app/api/points/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getPointById } from '@next-app/src/services/points/getPointById';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:points-shared:error');

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { uuid } = params;

    try {
      const point = await getPointById(uuid);
      return NextResponse.json({ data: { point } });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Точка не найдена') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при получении точки' },
      { status: 500 },
    );
  }
}
