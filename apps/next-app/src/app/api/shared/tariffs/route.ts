// app/api/tariffs/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { getTariffs } from '@next-app/src/services/tariffs/getTariffs';
import { parseParams } from '@next-app/src/utils/parsed-params/parseParams';
import { GetTariffsRequestDTO } from '@next-app/src/dto/tariffs/tariff.dto';

const logError = debug('app:api:tariffs-shared:error');

// GET: Получить список тарифов
export async function GET(req: NextRequest) {
  try {
    const parsedParams = parseParams<GetTariffsRequestDTO>({
      searchParams: new URL(req.url).searchParams,
      defaults: { sort_by: 'createdAt', sort_order: 'asc' },
      allowedSortFields: ['name', 'createdAt', 'updatedAt'],
    });

    try {
      const { tariffs, total, totalAllTariffs } = await getTariffs(parsedParams);

      return NextResponse.json({
        status: 'success',
        message: 'Fetched tariff successfully',
        data: {
          page: parsedParams.page,
          per_page: parsedParams.per_page,
          total,
          totalAllTariffs,
          tariffs,
        },
      });
    } catch (serviceError) {
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении тарифов');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch tariffs' },
      { status: 500 },
    );
  }
}
