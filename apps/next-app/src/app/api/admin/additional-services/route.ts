// app/api/admin/additional-services/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';

import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createAdditionalService } from '@next-app/src/services/additional-services/createAdditionalService';
import { CreateAdditionalServiceDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const log = debug('app:api:additional-services-admin');
const logError = debug('app:api:additional-services-admin:error');

// Роли, которые могут создавать дополнительные услуги
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// POST: Создание новой услуги
export async function POST(req: NextRequest) {
  try {
    log('Начало обработки POST-запроса');

    // Аутентификация запроса
    try {
      log('Проверка авторизации...');
      await authenticateRequest(req, allowedRoles);
      log('Авторизация успешна');
    } catch (authError) {
      logError('Ошибка авторизации:', authError);
      return NextResponse.json(
        { status: 'error', message: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 }, // Важно: статус 401 вместо 500
      );
    }

    log('Чтение данных запроса...');
    const data: CreateAdditionalServiceDTO = await req.json();
    log('Полученные данные:', data);

    try {
      log('Создание дополнительной услуги...');
      const createdAdditionalService = await createAdditionalService(data);
      log('Услуга успешно создана');

      // Успешный результат
      return NextResponse.json(createdAdditionalService);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Название услуги обязательно') {
          logError('Ошибка валидации: название услуги обязательно');
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    // Логируем ошибку
    logError('Ошибка при создании услуги');
    if (error instanceof Error) {
      logError('Сообщение ошибки:', error.message);
      logError('Стек ошибки:', error.stack);
    }

    // Проверяем на ошибки авторизации
    if (
      error instanceof Error &&
      (error.message.includes('Unauthorized') || error.message.includes('не авторизован'))
    ) {
      return NextResponse.json(
        { status: 'error', message: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { status: 'error', message: 'Unable to create additional service' },
      { status: 500 },
    );
  }
}
