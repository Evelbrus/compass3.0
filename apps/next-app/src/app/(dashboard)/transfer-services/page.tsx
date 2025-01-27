import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import VehiclesAdminPage from '@pages/(administrator)/vehicles/VehiclesAdminPage';
import VehiclesDriverPage from '@pages/(driver)/vehicles/main/VehiclesDriverPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      return <VehiclesAdminPage />;
    } else if (role === UserRole.Driver) {
      return <VehiclesDriverPage />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
