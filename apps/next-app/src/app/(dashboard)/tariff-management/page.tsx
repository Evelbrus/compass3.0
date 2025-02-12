import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import TariffAdminPage from '@pages/(administrator)/tariff/TariffAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { privateRoutes, publicRoutes } from '@shared/utils/routing';
import TariffClientCorpPage from '@pages/(client-corp)/tariff/TariffClientCorpPage';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      return <TariffAdminPage />;
    } else if (role === UserRole.Driver) {
      redirect(privateRoutes.ORDERS);
    } else if (role === UserRole.ClientCorp) {
      redirect(privateRoutes.HOME);
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
