import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ReferenceCreateBooks from '@pages/(administrator)/reference-books/ReferenceCreateBooks';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { role } = await getLayoutData();

  if (role === 'Admin' || role === 'Operator') {
    return <ReferenceCreateBooks />;
  } else {
    redirect('/');
  }
};

export default Page;
