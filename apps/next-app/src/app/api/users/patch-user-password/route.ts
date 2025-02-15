import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import bcrypt from 'bcryptjs';
import debug from 'debug';

const log = debug('app:update-user-password');

interface PatchPasswordParams {
  uuid: string;
  oldPassword: string;
  newPassword: string;
}

export async function PATCH(req: Request) {
  try {
    //Получаем параметры запроса
    const { uuid, oldPassword, newPassword } = (await req.json()) as PatchPasswordParams;

    if (!uuid || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'UUID, старый пароль и новый пароль обязательны' },
        { status: 400 },
      );
    }

    log('Получен запрос на изменение пароля для UUID:', uuid);

    //Находим пользователя по uuid
    const user = await prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    //Сравниваем старый пароль с хэшем из базы данных
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Старый пароль неверный' }, { status: 400 });
    }

    //Хэшируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    //Обновляем пароль пользователя
    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    log('Пароль обновлён для пользователя:', updatedUser.uuid);

    return NextResponse.json({
      status: 'success',
      message: 'Пароль успешно обновлён',
      uuid: updatedUser.uuid,
    });
  } catch (error) {
    log('Ошибка при обновлении пароля:', error);
    return NextResponse.json({ error: 'Не удалось обновить пароль' }, { status: 500 });
  }
}
