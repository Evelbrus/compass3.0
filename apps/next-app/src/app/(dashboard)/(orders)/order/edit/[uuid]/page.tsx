import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderEdit from '@pages/(administrator)/orders/OrderEdit';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page: React.FC<PageProps> = async ({ params }) => {
  const { role } = await getLayoutData();
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

  if (role === 'Admin' || role === 'Operator') {
    return <OrderEdit uuid={uuid} />;
  } else {
    redirect('/');
  }
};

export default Page;
