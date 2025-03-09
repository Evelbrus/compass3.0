import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { PatchUserDTO } from '@next-app/src/dto/users/user.dto';
import { User } from '@prisma/client';

const logError = debug('app:user-patch-admin:error');

export async function patchUser(data: PatchUserDTO): Promise<User> {
  const { uuid, profilePhotoPath, companyProfile, driverProfile } = data;
  const now = new Date();

  try {
    return await prisma.$transaction(async (prisma) => {
      const userUpdates: any = { updatedAt: now };
      if (profilePhotoPath) {
        userUpdates.profilePhotoPath = profilePhotoPath;
      }

      const updatedUser = await prisma.user.update({
        where: { uuid },
        data: userUpdates,
      });

      if (companyProfile?.logoImagePath) {
        await prisma.companyProfile.update({
          where: { userId: uuid },
          data: { logoImagePath: companyProfile.logoImagePath, updatedAt: now },
        });
      }

      if (driverProfile) {
        const driverUpdates: any = { updatedAt: now };
        if (driverProfile.passportPhotoPath)
          driverUpdates.passportPhotoPath = driverProfile.passportPhotoPath;
        if (driverProfile.profilePhotoPath)
          driverUpdates.profilePhotoPath = driverProfile.profilePhotoPath;
        if (driverProfile.licensePhotoPath)
          driverUpdates.licensePhotoPath = driverProfile.licensePhotoPath;

        await prisma.driverProfile.update({
          where: { userId: uuid },
          data: driverUpdates,
        });
      }

      return updatedUser;
    });
  } catch (error) {
    logError('× Ошибка при частичном обновлении пользователя:', error);
    throw error;
  }
}
