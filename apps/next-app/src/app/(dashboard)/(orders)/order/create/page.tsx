import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { OrderCreateView } from '@pages/(administrator)/orders/create/OrderCreate.view';
import OrderCreateClientCorp from '@pages/(client-corp)/orders/create/OrderCreateClientCorp';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { OrderStepConfig } from '@features/orders/create/ui/OrderStepSection';

export const revalidate = 60;

const adminOperatorSteps: OrderStepConfig[] = [
  { id: 'driverSelection', title: 'Выбор водителя', description: 'Выберите водителя для заказа' },
  { id: 'clientSelection', title: 'Выбор клиента', description: 'Выберите клиента для заказа' },
  { id: 'tariffServices', title: 'Тариф и услуги', description: 'Выберите тариф и дополнительные услуги' },
  { id: 'routeConfig', title: 'Конфигурация маршрута', description: 'Настройте маршрут поездки' },
  { id: 'routeInfo', title: 'Информация о маршруте', description: 'Просмотрите итоговую информацию о маршруте' },
];

const clientCorpSteps: OrderStepConfig[] = [
  { id: 'routeConfig', title: 'Настройка маршрута', description: 'Настройте подходящий вам маршрут' },
  { id: 'tariffServices', title: 'Выбор дополнительных услуг', description: 'Выберите тариф и дополнительные услуги' },
  { id: 'clientSelection', title: 'Выбор клиента', description: 'Выберите дату поездки и описание поездки' },
  { id: 'routeInfo', title: 'Подтверждение заказа', description: 'Подтвердите детали заказа' },
];

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
    return <OrderCreateClientCorp role={role} mode="create" userSession={userSession} steps={clientCorpSteps} />;
  }

  // Для Admin и Operator используем OrderCreateView
  return <OrderCreateView role={role} mode="create" userSession={userSession} steps={adminOperatorSteps} />;
};

export default Page;
