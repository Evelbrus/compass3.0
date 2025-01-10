import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import TariffAdminPage from '@pages/(administrator)/tariff/TariffAdminPage';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === 'Admin' || role === 'Operator') {
    return <TariffAdminPage />;
  } else {
    redirect('/');
  }
};

export default Page;
