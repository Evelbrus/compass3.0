import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientsDetailAdminPage from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();
  const { uuid } = await params;

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      //Получаем данные пользователя на сервере
      const userData = await prisma.user.findUnique({
        where: { uuid },
        include: {
          driverProfile: true,
          companyProfile: true,
        },
      });

      if (!userData) {
        return <Loading />;
      }

      console.log('Исходный userData', userData);

      //Убираем поля password и refreshTokens
      const { password, refreshTokens, ...safeUserData } = userData;

      console.log('Очищенный userData', safeUserData);

      return <ClientsDetailAdminPage userData={safeUserData} />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
