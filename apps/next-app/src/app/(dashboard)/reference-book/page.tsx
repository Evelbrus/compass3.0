import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import Loading from '@entities/loading/loading';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  } else if (role === UserRole.Admin || role === UserRole.Operator) {
    redirect('/reference-book/additional-services');
  } else {
    return <Loading />;
  }
};

export default Page;
