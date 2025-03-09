// app/api/admin/additional-services/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';

import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createAdditionalService } from '@next-app/src/services/additional-services/createAdditionalService';
import { CreateAdditionalServiceDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const logError = debug('app:api:additional-services-admin:error');

// Роли, которые могут создавать дополнительные услуги
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// POST: Создание новой услуги
export async function POST(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const data: CreateAdditionalServiceDTO = await req.json();

    try {
      const createdAdditionalService = await createAdditionalService(data);

      // Успешный результат — без логов
      return NextResponse.json(createdAdditionalService);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Название услуги обязательно') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    // Логируем только при ошибке
    logError('× Ошибка при создании услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to create additional service' },
      { status: 500 },
    );
  }
}
