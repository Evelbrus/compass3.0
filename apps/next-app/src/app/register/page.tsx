import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import RegisterPage from '@pages/register';
import Loading from '@entities/loading/loading';
import { redirect } from 'next/navigation';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (role) {
    redirect('/');
  } else if (refreshToken) {
    return <Loading />;
  } else {
    return <RegisterPage />;
  }
};

export default Page;
