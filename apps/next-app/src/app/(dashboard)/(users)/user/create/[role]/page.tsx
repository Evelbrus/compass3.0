import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import CreateUserAdminPage from '@pages/(administrator)/(users)/user/CreateUserAdminPage';
import { UserRole } from '@prisma/client';
import Loading from '@entities/loading/loading';
import { publicRoutes } from '@shared/utils/routing';

interface PageProps {
  params: Promise<{ role: string }>;
}

export const revalidate = 60;

const toUserRole = (role: string): UserRole | undefined => {
  switch (role.toLowerCase()) {
    case 'admin':
      return UserRole.Admin;
    case 'client':
      return UserRole.Client;
    case 'clientcorp':
      return UserRole.ClientCorp;
    case 'driver':
      return UserRole.Driver;
    case 'operator':
      return UserRole.Operator;
    default:
      return undefined;
  }
};

const Page: React.FC<PageProps> = async ({ params }) => {
  const { role: currentUserRole, refreshToken } = await getLayoutData();
  const resolvedParams = await params;
  const { role } = resolvedParams;

  console.log('role', role)

  const userRole = toUserRole(role);

  console.log('userRole', userRole)

  if (refreshToken) {
    if (!userRole) {
      return redirect('/');
    }
    if (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Operator) {
      return <CreateUserAdminPage role={userRole} mode={'create'} />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
