import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { PrismaClient } from '@prisma/client';
import ClientsDetailAdminPage from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page: React.FC<PageProps> = async ({ params }) => {
  const { role } = await getLayoutData();
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

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
