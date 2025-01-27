import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientsEditAdminPage from '@pages/(administrator)/(users)/user/ClientsEditAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role } = await getLayoutData();
  const { uuid } = await params;

  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

  //Получаем данные пользователя на сервере
  const userData = await prisma.user.findUnique({
    where: { uuid },
    include: {
      driverProfile: {
        include: {
          driverExperience: true,
        },
      },
      companyProfile: true,
    },
  });

  if (!userData) {
    return <Loading />;
  }

  return <ClientsEditAdminPage userData={userData} />;
};

export default Page;
