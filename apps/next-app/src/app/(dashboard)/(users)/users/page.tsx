import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientsAdminPage from '@pages/(administrator)/(users)/users/ClientsAdminPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === UserRole.Admin || role === UserRole.Operator) {
    return <ClientsAdminPage />;
  } else {
    return <Loading />;
  }
};

export default Page;
