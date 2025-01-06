import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { PrismaClient } from '@prisma/client';
import ClientsDetailAdminPage from '@pages/(client)/(users)/user/ClientsDetailAdminPage';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    uuid: string;
  };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps) => {
  const { role } = await getLayoutData();
  const { uuid } = await params;

  if (role !== 'Admin' && role !== 'Operator') {
    return redirect('/');
  }

  //Получаем данные пользователя на сервере
  const userData = await prisma.user.findUnique({
    where: { uuid },
    include: {
      driverProfile: true,
      companyProfile: true,
    },
  });

  if (!userData) {
    return redirect('/');
  }

  return <ClientsDetailAdminPage userData={userData} />;
};

export default Page;
