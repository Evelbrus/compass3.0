// app/api/additional-services/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getAdditionalServices } from '@next-app/src/services/additional-services/getAdditionalServices';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetAdditionalServicesRequestDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const logError = debug('app:api:additional-services-shared:error');

// GET: Получение списка услуг с пагинацией
export async function GET(req: NextRequest) {
  try {
    const parsedParams = parseParams<GetAdditionalServicesRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'asc' },
      allowedSortFields: ['name', 'createdAt', 'updatedAt'],
    });

    try {
      const { additionalServices, total } = await getAdditionalServices(parsedParams);

      // Успешный результат — без логов
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
      throw serviceError;
    }
  } catch (error) {
    // Логируем только при ошибке
    logError('× Ошибка при получении списка услуг');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch additional services' },
      { status: 500 },
    );
  }
}
