// app/api/admin/points/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updatePoint } from '@next-app/src/services/points/updatePoint';
import { deletePoint } from '@next-app/src/services/points/deletePoint';
import { UpdatePointDTO } from '@next-app/src/dto/points/point.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:points-admin:error');

// Роли, которые могут управлять точками
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// PUT: Обновление точки по UUID
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = await params;
    const data: UpdatePointDTO = await req.json();

    try {
      const updatedPoint = await updatePoint(uuid, data);
      return NextResponse.json(updatedPoint);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Все поля обязательны') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при обновлении точки' },
      { status: 500 },
    );
  }
}

// DELETE: Удаление точки по UUID
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = await params;

    try {
      await deletePoint(uuid);
      return NextResponse.json({ status: 'success', message: 'Точка удалена' });
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
    logError('× Ошибка при удалении точки');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при удалении точки' },
      { status: 500 },
    );
  }
}
