// app/src/services/users/updateUserPassword.ts
import { User } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import bcrypt from 'bcryptjs';
import debug from 'debug';
import { UpdatePasswordDTO } from '@next-app/src/dto/users/password.dto';

const logError = debug('app:update-user-password:error');

export async function updateUserPassword(params: UpdatePasswordDTO): Promise<User> {
  const { uuid, oldPassword, newPassword } = params;

  try {
    // Находим пользователя по uuid
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      logError(`× Пользователь с UUID ${uuid} не найден (404)`);
      throw new Error('Пользователь не найден');
    }

    // Сравниваем старый пароль с хэшем из базы данных
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logError(`× Неверный старый пароль для пользователя ${uuid} (400)`);
      throw new Error('Старый пароль неверный');
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
    logError('× Ошибка при обновлении пароля:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
