import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import DriversAdminPage from '@pages/(administrator)/(users)/driver/DriversAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === UserRole.Admin || role === UserRole.Operator) {
    return <DriversAdminPage />;
  } else {
    return <Loading />;
  }
};

export default Page;
