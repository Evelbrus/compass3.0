import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import LoginPage from '@pages/login';
import Loading from '@entities/loading/loading';
import { redirect } from 'next/navigation';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (refreshToken) {
    if (role) {
      redirect('/');
    } else {
      return <Loading />;
    }
  } else {
    return <LoginPage />;
  }
};

export default Page;
