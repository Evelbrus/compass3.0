// app/api/admin/users/password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { adminResetUserPassword } from '@next-app/src/services/users/adminResetUserPassword';
import { AdminUpdatePasswordDTO } from '@next-app/src/dto/users/password.dto';

const logError = debug('app:admin-reset-password-route:error');

// Только администраторы и операторы могут сбрасывать пароли
const allowedRoles = [UserRole.Admin, UserRole.Operator];

export async function PATCH(req: NextRequest) {
  try {
    // Аутентификация запроса с проверкой роли
    await authenticateRequest(req, allowedRoles);

    // Получаем параметры запроса
    const { uuid, newPassword } = (await req.json()) as AdminUpdatePasswordDTO;

    if (!uuid || !newPassword) {
      logError('× Отсутствуют обязательные поля (400)');
      return NextResponse.json({ error: 'UUID и новый пароль обязательны' }, { status: 400 });
    }

    try {
      const updatedUser = await adminResetUserPassword({ uuid, newPassword });

      return NextResponse.json({
        status: 'success',
        message: 'Пароль пользователя успешно сброшен',
        uuid: updatedUser.uuid,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Пользователь не найден') {
          return NextResponse.json({ error: serviceError.message }, { status: 404 });
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при сбросе пароля:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Не удалось сбросить пароль' }, { status: 500 });
  }
}
