import React, { JSX } from 'react';
import RegisterPage from '@pages/register';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  return <RegisterPage />;
};

export default Page;
