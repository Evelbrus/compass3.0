import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientsAdminPage from '@pages/(administrator)/(users)/user/ClientsAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import convertPrismaData from '@shared/prisma/utils/converterBigIntToString';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  //Ждём, пока промис params разрешится, чтобы получить uuid
  const { uuid } = await params;

  const { role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

  let userData = null;
  try {
    userData = await prisma.user.findUnique({
      where: { uuid },
      include: {
        driverProfile: {
          include: {
            driverExperience: {
              select: {
                uuid: true,
                companyName: true,
                position: true,
                from: true,
                to: true,
                driverProfileId: true,
              },
            },
          },
        },
        companyProfile: true,
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    return <Loading />;
  }

  if (!userData) {
    return <Loading />;
  }

  //Исключаем поля password и refreshTokens
  const { password, refreshTokens, ...userDataWithoutSensitive } = userData;

  //Приводим userData к нужной форме и преобразуем данные (например, BigInt -> string)
  const safeUserData: UserCard = convertPrismaData({
    ...userDataWithoutSensitive,
    companyProfile: userDataWithoutSensitive.companyProfile
      ? {
          ...userDataWithoutSensitive.companyProfile,
          logoImage: null,
        }
      : undefined,
    driverProfile: userDataWithoutSensitive.driverProfile
      ? {
          ...userDataWithoutSensitive.driverProfile,
          passportImage: null,
          driverProfileImage: null,
          licenseImage: null,
          driverExperience: Array.isArray(userDataWithoutSensitive.driverProfile.driverExperience)
            ? userDataWithoutSensitive.driverProfile.driverExperience
            : [],
        }
      : undefined,
    //Разбиваем fullName на части
    ...(userDataWithoutSensitive.fullName
      ? (() => {
          const parts = userDataWithoutSensitive.fullName.split(' ');
          return {
            lastName: parts[0] || '',
            firstName: parts[1] || '',
            middleName: parts.length > 2 ? parts.slice(2).join(' ') : '',
          };
        })()
      : { firstName: '', lastName: '', middleName: '' }),
  });

  console.log('userDataEdit', safeUserData);

  return <ClientsAdminPage role={role} mode={'edit'} userData={safeUserData} />;
};

export default Page;
