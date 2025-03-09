// app/api/admin/tariffs/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updateTariff } from '@next-app/src/services/tariffs/updateTariff';
import { UpdateTariffDTO } from '@next-app/src/dto/tariffs/tariff.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:tariffs-admin:error');

// Роли, которые могут обновлять тарифы
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// PUT: Обновить тариф
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = params;
    const data: UpdateTariffDTO = await req.json();

    try {
      const updatedTariff = await updateTariff(uuid, data);

      return NextResponse.json({
        status: 'success',
        message: 'Tariff updated successfully',
        uuid: updatedTariff.uuid,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Missing required parameter: uuid') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении тарифа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to update tariff' },
      { status: 500 },
    );
  }
}
