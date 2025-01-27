import React, { JSX } from 'react';
import LoginPage from '@pages/login';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { redirect } from 'next/navigation';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { isAuthenticated } = await getLayoutData();

  if (isAuthenticated) {
    redirect('/');
  }

  return <LoginPage />;
};

export default Page;
