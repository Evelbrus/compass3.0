// app/src/services/users/adminResetUserPassword.ts
import { User } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import bcrypt from 'bcryptjs';
import debug from 'debug';

import { AdminUpdatePasswordDTO } from '@next-app/src/dto/users/password.dto';

const logError = debug('app:admin-reset-password:error');

export async function adminResetUserPassword(params: AdminUpdatePasswordDTO): Promise<User> {
  const { uuid, newPassword } = params;

  try {
    // Находим пользователя по uuid
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      logError(`× Пользователь с UUID ${uuid} не найден (404)`);
      throw new Error('Пользователь не найден');
    }

    // Хэшируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль пользователя
    return prisma.user.update({
      where: { uuid },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logError('× Ошибка при сбросе пароля:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
