// src/services/users/updateUserPassword.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UpdatePasswordDTO } from '@next-app/src/dto/users/password.dto';
import { comparePassword, hashPassword } from '@next-app/src/utils/auth/password';

const logError = debug('app:update-user-password:error');

export async function updateUserPassword(params: UpdatePasswordDTO) {
  const { uuid, oldPassword, newPassword } = params;

  try {
    // Найти пользователя по UUID
    const user = await prisma.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        password: true,
      },
    });

    // Проверить, существует ли пользователь
    if (!user) {
      logError('× Пользователь не найден');
      throw new Error('Пользователь не найден');
    }

    // Проверить соответствие старого пароля
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      logError('× Старый пароль неверный');
      throw new Error('Старый пароль неверный');
    }

    // Хешировать новый пароль
    const hashedPassword = await hashPassword(newPassword);

    // Обновить пароль в базе данных
    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      select: {
        uuid: true,
      },
    });

    return updatedUser;
  } catch (error) {
    logError('× Ошибка при обновлении пароля:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
