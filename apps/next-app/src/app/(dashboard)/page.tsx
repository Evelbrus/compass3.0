import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import HomeAdminPage from '@pages/(administrator)/home';
import HomeDriverPage from '@pages/(driver)/home';
import HomeClientCorpPage from '@pages/(client-corp)/home';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === 'Admin' || role === 'Operator') {
    return <HomeAdminPage />;
  } else if (role === 'Driver') {
    return <HomeDriverPage />;
  } else if (role === 'ClientCorp') {
    return <HomeClientCorpPage />;
  } else {
    redirect('/login');
  }
};

export default Page;
