import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientsCreateAdminPage from '@pages/(client)/(users)/user/ClientsCreateAdminPage';
import { UserRole } from '@prisma/client';

interface PageProps {
  params: {
    role: UserRole;
  };
}

export const revalidate = 60;

const toUserRole = (role: string): UserRole | undefined => {
  switch (role.toLowerCase()) {
    case 'admin':
      return UserRole.Admin;
    case 'client':
      return UserRole.Client;
    case 'client-corp':
      return UserRole.ClientCorp;
    case 'driver':
      return UserRole.Driver;
    case 'operator':
      return UserRole.Operator;
    default:
      return undefined;
  }
};

const Page = async ({ params }: PageProps) => {
  const { role: currentUserRole } = await getLayoutData();
  const { role } = params;

  //Преобразование строки из URL в значение перечисления UserRole
  const userRole = toUserRole(role);

  console.log('userRole:', userRole);

  if (!userRole) {
    return redirect('/');
  }

  if (currentUserRole === 'Admin' || currentUserRole === 'Operator') {
    return <ClientsCreateAdminPage role={userRole} />;
  } else {
    redirect('/');
  }
};

export default Page;
