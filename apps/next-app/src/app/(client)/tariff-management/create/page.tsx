import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import TariffCreateForm from '@pages/(client)/tariff/TariffCreateForm';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === 'Admin' || role === 'Operator') {
    return <TariffCreateForm />;
  } else {
    redirect('/');
  }
};

export default Page;
