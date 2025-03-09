// app/api/admin/tariffs/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createTariff } from '@next-app/src/services/tariffs/createTariff';
import { CreateTariffDTO } from '@next-app/src/dto/tariffs/tariff.dto';

const logError = debug('app:api:tariffs-admin:error');

// Роли, которые могут создавать тарифы
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// POST: Создать тариф
export async function POST(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const data: CreateTariffDTO = await req.json();

    try {
      const newTariff = await createTariff(data);

      return NextResponse.json({
        status: 'success',
        message: 'Tariff created successfully',
        uuid: newTariff.uuid,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Missing required fields') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при создании тарифа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to create tariff' },
      { status: 500 },
    );
  }
}
