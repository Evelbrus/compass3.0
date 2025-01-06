import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { PrismaClient } from '@prisma/client';
import ReferenceEditBooks from '@pages/(client)/reference-books/ReferenceEditBooks';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    uuid: string;
  };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps) => {
  const { role } = await getLayoutData();
  const { uuid } = params;

  if (role !== 'Admin' && role !== 'Operator') {
    return redirect('/');
  }

  //Получаем данные уровня обслуживания на сервере
  const serviceLevel = await prisma.serviceLevel.findUnique({
    where: { uuid },
  });

  if (!serviceLevel) {
    return redirect('/');
  }

  return <ReferenceEditBooks data={serviceLevel} />;
};

export default Page;
