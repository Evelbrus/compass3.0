// app/api/admin/points/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { createPoint } from '@next-app/src/services/points/createPoint';
import { CreatePointDTO } from '@next-app/src/dto/points/point.dto';

const logError = debug('app:api:admin-points:error');

// Роли, которые могут создавать точки
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// POST: Создание новой точки
export async function POST(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const data: CreatePointDTO = await req.json();

    try {
      const createdPoint = await createPoint(data);
      return NextResponse.json(createdPoint);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (
          serviceError.message ===
          'Адрес, цена за километр, коэффициент сложности, широта и долгота обязательны'
        ) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при создании точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при создании точки' },
      { status: 500 },
    );
  }
}
