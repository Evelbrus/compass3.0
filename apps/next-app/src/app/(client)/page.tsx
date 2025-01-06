import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { lang, role } = await getLayoutData();

  return redirect('/users');
};

export default Page;
