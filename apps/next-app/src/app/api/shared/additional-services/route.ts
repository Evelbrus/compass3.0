// app/api/additional-services/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getAdditionalServices } from '@next-app/src/services/additional-services/getAdditionalServices';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetAdditionalServicesRequestDTO } from '@next-app/src/dto/additional-services/additional-service.dto';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';

const log = debug('app:api:additional-services-shared');
const logError = debug('app:api:additional-services-shared:error');

// GET: Получение списка услуг с пагинацией
export async function GET(req: NextRequest) {
  await authenticateRequest(req);

  try {
    log('Начало обработки GET-запроса');

    const parsedParams = parseParams<GetAdditionalServicesRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'asc' },
      allowedSortFields: ['name', 'createdAt', 'updatedAt'],
    });

    try {
      log('Получение списка дополнительных услуг...');
      const { additionalServices, total } = await getAdditionalServices(parsedParams);
      log('Услуги успешно получены, общее количество:', total);

      // Успешный результат
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
    } catch (serviceError) {
      logError('Ошибка сервиса при получении услуг:', serviceError);
      throw serviceError;
    }
  } catch (error) {
    // Логируем только при ошибке
    logError('× Ошибка при получении списка услуг');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }

    // Проверяем на ошибки авторизации
    if (
      error instanceof Error &&
      (error.message.includes('Unauthorized') || error.message.includes('не авторизован'))
    ) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          redirectTo: new URL('/login', req.url).toString(),
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch additional services' },
      { status: 500 },
    );
  }
}
