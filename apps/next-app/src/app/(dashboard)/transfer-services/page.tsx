import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import VehiclesAdminPage from '@pages/(administrator)/vehicles/VehiclesAdminPage';
import VehiclesDriverPage from '@pages/(driver)/vehicles/main/VehiclesDriverPage';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === 'Admin' || role === 'Operator') {
    return <VehiclesAdminPage />;
  } else if (role === 'Driver') {
    return <VehiclesDriverPage />;
  } else {
    redirect('/');
  }
};

export default Page;
