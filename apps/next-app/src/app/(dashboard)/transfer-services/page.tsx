import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import VehiclesAdminPage from '@pages/(administrator)/vehicles/VehiclesAdminPage';
import VehiclesDriverPage from '@pages/(driver)/vehicles/main/VehiclesDriverPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === UserRole.Admin || role === UserRole.Operator) {
    return <VehiclesAdminPage />;
  } else if (role === UserRole.Driver) {
    return <VehiclesDriverPage />;
  } else {
    return <Loading />;
  }
};

export default Page;
