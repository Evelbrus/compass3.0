import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import OrderCreateView from '@pages/(administrator)/orders/create/OrderCreate.view';
import Loading from '@entities/loading/loading';
import {
  UserRole,
  User,
  Point,
  Tariff,
  TariffOnService,
  OrderOnTariffAdditionalService,
} from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { prisma } from '@shared/prisma/prisma-client';

// Типы для безопасной работы с данными
type SafeUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone'>;

type OrderData = {
  uuid: string;
  createdBy: SafeUser;
  tariff: Pick<Tariff, 'uuid' | 'name' | 'serviceLevel' | 'vehicleType'> & {
    tariffAdditionalServices: (TariffOnService & {
      orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
    })[];
  };
  departurePoint: Pick<
    Point,
    'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > & {
    pricePerKm: number; // Изменено на number, так как pricePerKm в Prisma — Decimal
  };
  arrivalPoint: Pick<
    Point,
    'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > & {
    pricePerKm: number; // Изменено на number
  };
  assignedDriver?: SafeUser;
  departureTime: string;
  selectedServices: string[];
};

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { uuid } = await params;
  console.log('uuid из params:', uuid);

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
    // Получение данных из Prisma
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        tariff: {
          include: {
            tariffAdditionalServices: {
              include: {
                orderTariffAdditionalServices: {
                  where: { orderUuid: uuid },
                },
              },
            },
          },
        },
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
          },
        },
      },
    });

    if (!order) {
      return <Loading />;
    }

    // Преобразование данных в сериализуемый формат
    orderData = {
      uuid: order.uuid,
      createdBy: {
        uuid: order.createdBy.uuid,
        fullName: order.createdBy.fullName,
        email: order.createdBy.email,
        phone: order.createdBy.phone,
      },
      tariff: {
        uuid: order.tariff.uuid,
        name: order.tariff.name,
        serviceLevel: order.tariff.serviceLevel,
        vehicleType: order.tariff.vehicleType,
        tariffAdditionalServices: order.tariff.tariffAdditionalServices.map((service) => ({
          ...service,
          price: Number(service.price), // Преобразуем Int в number
          orderTariffAdditionalServices: service.orderTariffAdditionalServices,
        })),
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        pricePerKm: Number(order.departurePoint.pricePerKm), // Преобразуем Decimal в number
        airport: order.departurePoint.airport,
        latitude: Number(order.departurePoint.latitude),
        longitude: Number(order.departurePoint.longitude),
        terrainDifficulty: Number(order.departurePoint.terrainDifficulty),
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        pricePerKm: Number(order.arrivalPoint.pricePerKm), // Преобразуем Decimal в number
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
          }
        : undefined,
      departureTime: order.departureTime
        ? order.departureTime.toISOString()
        : new Date().toISOString(),
      selectedServices: order.tariff.tariffAdditionalServices
        .filter((service) => service.orderTariffAdditionalServices.length > 0)
        .map((service) => service.uuid),
    };

    console.log('orderData перед передачей:', orderData);
  } catch (error) {
    console.error('Ошибка при загрузке данных заказа:', error);
    return <Loading />;
  }

  // Передача данных в клиентский компонент
  return <OrderCreateView role={role} mode="edit" orderData={orderData} />;
};

export default Page;
