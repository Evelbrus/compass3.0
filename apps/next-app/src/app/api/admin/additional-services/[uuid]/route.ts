// app/api/admin/additional-services/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updateAdditionalService } from '@next-app/src/services/additional-services/updateAdditionalService';
import { deleteAdditionalService } from '@next-app/src/services/additional-services/deleteAdditionalService';
import { UpdateAdditionalServiceDTO } from '@next-app/src/dto/additional-services/additional-service.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:additional-services-admin:error');

// Роли, которые могут управлять дополнительными услугами
const allowedRoles = [UserRole.Admin, UserRole.Operator];

// PUT: Обновление услуги по UUID
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } =  params;
    const data: UpdateAdditionalServiceDTO = await req.json();

    try {
      const updatedService = await updateAdditionalService(uuid, data);
      return NextResponse.json(updatedService);
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
    logError('× Ошибка при обновлении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при обновлении услуги' },
      { status: 500 },
    );
  }
}

// DELETE: Удаление услуги по UUID
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    const { uuid } = params;

    try {
      await deleteAdditionalService(uuid);
      return NextResponse.json({ status: 'success', message: 'Услуга удалена' });
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
    logError('× Ошибка при удалении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при удалении услуги' },
      { status: 500 },
    );
  }
}
