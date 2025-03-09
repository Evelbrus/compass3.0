// app/api/users/password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';
import { updateUserPassword } from '@next-app/src/services/users/updateUserPassword';
import { UpdatePasswordDTO } from '@next-app/src/dto/users/password.dto';

const logError = debug('app:update-user-password-route:error');

// Определяем, какие роли имеют право изменять пароли
const allowedRoles = [
  UserRole.Admin,
  UserRole.Operator,
  UserRole.Client,
  UserRole.ClientCorp,
  UserRole.Driver,
];

export async function PATCH(req: NextRequest) {
  try {
    // Аутентификация запроса
    await authenticateRequest(req, allowedRoles);

    // Получаем параметры запроса
    const { uuid, oldPassword, newPassword } = (await req.json()) as UpdatePasswordDTO;

    if (!uuid || !oldPassword || !newPassword) {
      logError('× Отсутствуют обязательные поля (400)');
      return NextResponse.json(
        { error: 'UUID, старый пароль и новый пароль обязательны' },
        { status: 400 },
      );
    }

    try {
      const updatedUser = await updateUserPassword({ uuid, oldPassword, newPassword });

      return NextResponse.json({
        status: 'success',
        message: 'Пароль успешно обновлён',
        uuid: updatedUser.uuid,
      });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Пользователь не найден') {
          return NextResponse.json({ error: serviceError.message }, { status: 404 });
        }
        if (serviceError.message === 'Старый пароль неверный') {
          return NextResponse.json({ error: serviceError.message }, { status: 400 });
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при обновлении пароля:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Не удалось обновить пароль' }, { status: 500 });
  }
}
