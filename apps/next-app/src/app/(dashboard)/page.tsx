import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import HomeAdminPage from '@pages/(administrator)/home';
import HomeDriverPage from '@pages/(driver)/home';
import HomeClientCorpPage from '@pages/(client-corp)/home';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      return <HomeAdminPage />;
    } else if (role === UserRole.Driver) {
      return <HomeDriverPage />;
    } else if (role === UserRole.ClientCorp) {
      return <HomeClientCorpPage />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
