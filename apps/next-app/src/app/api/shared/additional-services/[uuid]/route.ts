// app/api/additional-services/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getAdditionalServiceById } from '@next-app/src/services/additional-services/getAdditionalServiceById';
import { Params } from '@next-app/src/interface/interface';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';

const logError = debug('app:api:additional-services-shared:error');

export async function GET(req: NextRequest, { params }: { params: Params }) {
  await authenticateRequest(req);

  try {
    const { uuid } = params;

    try {
      const service = await getAdditionalServiceById(uuid);
      return NextResponse.json(service);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Услуга не найдена') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при получении услуги' },
      { status: 500 },
    );
  }
}
