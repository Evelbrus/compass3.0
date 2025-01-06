import React, { JSX } from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderEdit from '@pages/(client)/orders/OrderEdit';

interface PageProps {
  params: {
    uuid: string;
  };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps) => {
  const { role } = await getLayoutData();
  const { uuid } = await params;

  if (role === 'Admin' || role === 'Operator') {
    return <OrderEdit uuid={uuid} />;
  } else {
    redirect('/');
  }
};

export default Page;
