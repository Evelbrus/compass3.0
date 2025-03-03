import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderCreateView from '@pages/(administrator)/orders/create/OrderCreate.view';
import OrderCreateClientCorp from '@pages/(client-corp)/orders/create/OrderCreateClientCorp';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

export const revalidate = 60;

const Page = async (): Promise<JSX.Element> => {
  const { userSession, role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  // Проверка допустимых ролей
  if (role !== UserRole.Admin && role !== UserRole.Operator && role !== UserRole.ClientCorp) {
    return <Loading />;
  }

  // Выбор компонента в зависимости от роли
  if (role === UserRole.ClientCorp) {
    return <OrderCreateClientCorp role={role} mode="create" userSession={userSession} />;
  }

  // Для Admin и Operator используем OrderCreateView
  return <OrderCreateView role={role} mode="create" userSession={userSession} />;
};

export default Page;
