import React, { JSX } from 'react';
import LoginPage from '@pages/login';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { lang, isAuthenticated } = await getLayoutData();

  return <LoginPage lang={lang} isAuthenticated={isAuthenticated} />;
};

export default Page;
