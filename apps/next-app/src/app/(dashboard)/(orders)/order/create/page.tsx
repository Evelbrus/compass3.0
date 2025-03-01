import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderCreateView from '@pages/(administrator)/orders/create/OrderCreate.view';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { OrderStepType } from '@features/orders/create/config/steps';

export const revalidate = 60;

// Настройка шагов для Admin и Operator
const adminOperatorStepsConfig = {
  'route-info': {
    title: 'Информация о заказе',
    description: 'Основная информация о редактируемом заказе',
  },
  'client-selection': {
    title: 'Клиент',
    description: 'Информация о клиенте заказа',
  },
  'route-config': {
    title: 'Маршрут',
    description: 'Настройка маршрута поездки',
  },
  'tariff-services': {
    title: 'Тариф и услуги',
    description: 'Выбор тарифа и дополнительных услуг',
  },
  'driver-selection': {
    title: 'Водитель',
    description: 'Назначение водителя на заказ',
  },
};

// Порядок шагов для Admin и Operator
const adminOperatorStepsOrder: OrderStepType[] = [
  'driver-selection',
  'client-selection',
  'tariff-services',
  'route-config',
  'route-info',
];

// Настройка шагов для ClientCorp
const clientCorpStepsConfig = {
  'route-config': {
    title: 'Маршрут',
    description: 'Настройка маршрута поездки',
  },
  'tariff-services': {
    title: 'Тариф и услуги',
    description: 'Выбор тарифа и дополнительных услуг',
  },
  'route-info': {
    title: 'Информация о заказе',
    description: 'Подтверждение деталей заказа',
  },
};

// Порядок шагов для ClientCorp
const clientCorpStepsOrder: OrderStepType[] = [
  'route-config',
  'tariff-services',
  'client-selection',
  'route-info',
];

const Page = async (): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  // Проверка допустимых ролей
  if (role !== UserRole.Admin && role !== UserRole.Operator && role !== UserRole.ClientCorp) {
    return <Loading />;
  }

  // Выбор конфигурации в зависимости от роли
  let stepsConfig;
  let stepsOrder;

  if (role === UserRole.ClientCorp) {
    stepsConfig = clientCorpStepsConfig;
    stepsOrder = clientCorpStepsOrder;
  } else {
    stepsConfig = adminOperatorStepsConfig;
    stepsOrder = adminOperatorStepsOrder;
  }

  return (
    <OrderCreateView
      role={role}
      mode="create"
      customStepsConfig={stepsConfig}
      customStepsOrder={stepsOrder}
    />
  );
};

export default Page;