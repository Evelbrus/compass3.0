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

  console.log('🚀 userData до обработки:', JSON.stringify(userData, null, 2));

  const safeUserData: UserCard = convertPrismaData({
    ...userData,
    companyProfile: userData.companyProfile
      ? {
          ...userData.companyProfile,
          logoImage: null,
        }
      : undefined,
    driverProfile: userData.driverProfile
      ? {
          ...userData.driverProfile,
          passportImage: null,
          driverProfileImage: null,
          licenseImage: null,
          driverExperience: Array.isArray(userData.driverProfile.driverExperience)
            ? userData.driverProfile.driverExperience
            : [],
        }
      : undefined,
    //Разбиваем fullName на части
    ...(userData.fullName
      ? (() => {
          const parts = userData.fullName.split(' ');
          return {
            lastName: parts[0] || '',
            firstName: parts[1] || '',
            middleName: parts.length > 2 ? parts.slice(2).join(' ') : '',
          };
        })()
      : { firstName: '', lastName: '', middleName: '' }),
  });

  console.log('✅ userData после обработки:', JSON.stringify(safeUserData, null, 2));

  return <ClientsAdminPage role={role} mode={'edit'} userData={safeUserData} />;
};

export default Page;
