import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import VehiclesFormPage from '@pages/(administrator)/vehicles/VehiclesFormPage';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      return <VehiclesFormPage mode={'create'} />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
