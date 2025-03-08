import { DriverAcceptanceStatus, User, UserRole } from '@prisma/client';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const logError = debug('app:user-patch:error');

// Интерфейс для частичного обновления пользователя
interface PatchUserData {
  uuid: string;
  role?: UserRole;
  [key: string]: any;
}

// Частичное обновление пользователя (PATCH)
export async function patchUser(data: PatchUserData): Promise<User> {
  const { uuid, role, ...fields } = data;
  const now = new Date();

  try {
    const updateData: Record<string, any> = {
      ...fields,
      updatedAt: now,
    };

    if (role === 'Driver') {
      updateData.driverAcceptanceStatus = DriverAcceptanceStatus.TAKEN;
    }

    const updatedUser = await prisma.user.update({
      where: { uuid },
      data: updateData,
    });

    return updatedUser;
  } catch (error) {
    logError('× Ошибка при частичном обновлении пользователя:', error);
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
