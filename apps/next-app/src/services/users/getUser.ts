// app/api/admin/users/[uuid]/getUser.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UserDetailResponseDTO } from '@next-app/src/dto/users/user.dto';

const logError = debug('app:user-get:error');

// Получение пользователя по UUID с детальной информацией
export async function getUser(uuid: string): Promise<UserDetailResponseDTO | null> {
  try {
    // Получаем пользователя со всей необходимой вложенной информацией
    const user = await prisma.user.findUnique({
      where: { uuid },
      include: {
        // Включаем профиль водителя, если он есть
        driverProfile: {
          include: {
            // Также включаем опыт работы водителя
            driverExperience: {
              select: {
                uuid: true,
                companyName: true,
                position: true,
                from: true,
                to: true,
              },
            },
            // Включаем историю водителя, если она нужна
            driverHistory: true,
          },
        },
        // Включаем профиль компании, если он есть
        companyProfile: true,
      },
    });

    if (!user) {
      return null;
    }

    // Преобразуем BigInt в строки, если они есть
    return JSON.parse(
      JSON.stringify(user, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
    ) as UserDetailResponseDTO;
  } catch (error) {
    logError('× Ошибка при получении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
