import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderCreateView from '@pages/(administrator)/orders/create/OrderCreate.view';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { prisma } from '@shared/prisma/prisma-client';
import { OrderData } from '@features/orders/create/types/types';
import { OrderStepType } from '@features/orders/create/config/steps';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

// Настройка шагов для режима редактирования заказа
const editOrderStepsConfig = {
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

// Порядок шагов для режима редактирования
const editOrderStepsOrder: OrderStepType[] = [
  'driver-selection',
  'client-selection',
  'tariff-services',
  'route-config',
  'route-info',
];

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { uuid } = await params;

  const { role, refreshToken } = await getLayoutData();

  // Проверка авторизации
  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  // Проверка роли пользователя
  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

  let orderData: OrderData | null = null;

  try {
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        tariff: true, // Получаем полные данные о тарифе
        departurePoint: {
          select: {
            uuid: true,
            address: true,
            pricePerKm: true,
            airport: true,
            latitude: true,
            longitude: true,
            terrainDifficulty: true,
          },
        },
        arrivalPoint: {
          select: {
            uuid: true,
            address: true,
            pricePerKm: true,
            airport: true,
            latitude: true,
            longitude: true,
            terrainDifficulty: true,
          },
        },
        assignedDriver: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            profilePhotoPath: true,
          },
        },
      },
    });

    if (!order) {
      return <Loading />;
    }

    // Получение tariffAdditionalServices отдельно
    const tariffWithServices = await prisma.tariff.findUnique({
      where: { uuid: order.tariff.uuid },
      include: {
        tariffAdditionalServices: {
          include: {
            orderTariffAdditionalServices: {
              where: { orderUuid: uuid },
            },
          },
        },
      },
    });

    if (!tariffWithServices) {
      return <Loading />;
    }

    // Получение полных данных для intermediatePoints
    const intermediatePointsData = await prisma.point.findMany({
      where: {
        uuid: { in: order.intermediatePoints },
      },
      select: {
        uuid: true,
        address: true,
        pricePerKm: true,
        airport: true,
        latitude: true,
        longitude: true,
        terrainDifficulty: true,
      },
    });

    // Формирование orderData
    orderData = {
      uuid: order.uuid,
      createdBy: {
        uuid: order.createdBy.uuid,
        fullName: order.createdBy.fullName,
        email: order.createdBy.email,
        phone: order.createdBy.phone,
        role: order.createdBy.role,
      },
      tariff: {
        ...order.tariff, // Используем все поля из tariff
        tariffAdditionalServices: tariffWithServices.tariffAdditionalServices.map((service) => ({
          ...service,
          price: Number(service.price),
        })),
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        pricePerKm: Number(order.departurePoint.pricePerKm),
        airport: order.departurePoint.airport,
        latitude: Number(order.departurePoint.latitude),
        longitude: Number(order.departurePoint.longitude),
        terrainDifficulty: Number(order.departurePoint.terrainDifficulty),
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        pricePerKm: Number(order.arrivalPoint.pricePerKm),
        airport: order.arrivalPoint.airport,
        latitude: Number(order.arrivalPoint.latitude),
        longitude: Number(order.arrivalPoint.longitude),
        terrainDifficulty: Number(order.arrivalPoint.terrainDifficulty),
      },
      assignedDriver: order.assignedDriver
        ? {
            uuid: order.assignedDriver.uuid,
            fullName: order.assignedDriver.fullName,
            email: order.assignedDriver.email,
            phone: order.assignedDriver.phone,
            role: order.assignedDriver.role,
            profilePhotoPath: order.assignedDriver.profilePhotoPath,
          }
        : undefined,
      departureTime: order.departureTime
        ? order.departureTime.toISOString()
        : new Date().toISOString(),
      description: order.description,
      flightNumber: order.flightNumber,
      basePrice: Number(order.basePrice),
      waitingTimeMinutes: Number(order.waitingTimeMinutes),
      selectedServices: tariffWithServices.tariffAdditionalServices
        .filter((service) => service.orderTariffAdditionalServices.length > 0)
        .map((service) => service.uuid),
      intermediatePoints: intermediatePointsData.map((point) => ({
        uuid: point.uuid,
        address: point.address,
        pricePerKm: Number(point.pricePerKm),
        airport: point.airport,
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        terrainDifficulty: Number(point.terrainDifficulty),
      })),
      status: order.status,
    };
  } catch (error) {
    console.error('Ошибка при загрузке данных заказа:', error);
    return <Loading />;
  }

  // Передача данных в клиентский компонент с настройкой шагов
  return (
    <OrderCreateView
      role={role}
      mode="edit"
      orderData={orderData}
      customStepsConfig={editOrderStepsConfig}
      customStepsOrder={editOrderStepsOrder}
    />
  );
};

export default Page;
