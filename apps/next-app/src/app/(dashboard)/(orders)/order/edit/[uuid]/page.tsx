import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { OrderCreateView } from '@pages/(administrator)/orders/create/OrderCreate.view';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { prisma } from '@shared/prisma/prisma-client';
import { OrderData } from '@features/orders/create/types/types';
import { OrderStepConfig } from '@features/orders/create/ui/OrderStepSection';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const adminOperatorSteps: OrderStepConfig[] = [
  { id: 'driverSelection', title: 'Выбор водителя', description: 'Выберите водителя для заказа' },
  { id: 'clientSelection', title: 'Выбор клиента', description: 'Выберите клиента для заказа' },
  { id: 'tariffServices', title: 'Тариф и услуги', description: 'Выберите тариф и дополнительные услуги' },
  { id: 'routeConfig', title: 'Конфигурация маршрута', description: 'Настройте маршрут поездки' },
  { id: 'routeInfo', title: 'Информация о маршруте', description: 'Просмотрите итоговую информацию о маршруте' },
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
        clientBy: {
          select: {
            uuid: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        tariff: true,
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
          include: {
            vehicleDriver: {
              include: {
                vehicle: {
                  select: {
                    uuid: true,
                    vehicleType: true,
                    serviceLevels: true,
                    plateNumber: true,
                    isAvailable: true,
                  },
                },
              },
            },
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
      clientBy: {
        uuid: order.clientBy.uuid,
        fullName: order.clientBy.fullName,
        email: order.clientBy.email,
        phone: order.clientBy.phone,
        role: order.clientBy.role,
      },
      tariff: {
        ...order.tariff,
        tariffAdditionalServices: tariffWithServices.tariffAdditionalServices.map((service) => ({
          uuid: service.uuid,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          tariffUuid: service.tariffUuid,
          price: Number(service.price),
          isAvailable: service.isAvailable,
          serviceUuid: service.serviceUuid,
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
          lastActive: order.assignedDriver.lastActive,
          vehicleDriver: order.assignedDriver.vehicleDriver
            ? {
              uuid: order.assignedDriver.vehicleDriver.uuid,
              createdAt: order.assignedDriver.vehicleDriver.createdAt,
              updatedAt: order.assignedDriver.vehicleDriver.updatedAt,
              driverId: order.assignedDriver.vehicleDriver.driverId,
              vehicleId: order.assignedDriver.vehicleDriver.vehicleId,
              assignmentDate: order.assignedDriver.vehicleDriver.assignmentDate,
              vehicle: {
                uuid: order.assignedDriver.vehicleDriver.vehicle.uuid,
                vehicleType: order.assignedDriver.vehicleDriver.vehicle.vehicleType,
                serviceLevels: order.assignedDriver.vehicleDriver.vehicle.serviceLevels,
                plateNumber: order.assignedDriver.vehicleDriver.vehicle.plateNumber,
                isAvailable: order.assignedDriver.vehicleDriver.vehicle.isAvailable,
              },
            }
            : undefined,
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
        .map((service) => ({
          uuid: service.uuid,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          tariffUuid: service.tariffUuid,
          price: Number(service.price),
          isAvailable: service.isAvailable,
          serviceUuid: service.serviceUuid,
        })),
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

  // Передача данных в клиентский компонент
  return <OrderCreateView role={role} mode="edit" orderData={orderData} steps={adminOperatorSteps} />;
};

export default Page;
