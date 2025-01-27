import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { prisma } from '@shared/prisma/prisma-client';
import VehiclesDetail from '@pages/(administrator)/vehicles/VehiclesDetail';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page: React.FC<PageProps> = async ({ params }) => {
  try {
    const { role, userProfile } = await getLayoutData();
    const resolvedParams = await params;
    const { uuid } = resolvedParams;

    //Проверка авторизации и роли
    if (!role || !['Admin', 'Operator', 'Driver'].includes(role)) {
      return redirect('/');
    }

    //Проверка наличия профиля пользователя
    const userUuid = userProfile?.uuid;
    if (!userUuid) return redirect('/');

    //Получение данных транспортного средства
    const vehicle = await prisma.vehicle.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        vehicleType: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        plateNumber: true,
        isAvailable: true,
        photoPath: true,
        serviceLevels: true,
        createdAt: true,
        updatedAt: true,
        vehicleDrivers: {
          select: {
            uuid: true,
            assignmentDate: true,
            driver: {
              select: {
                uuid: true,
                fullName: true,
                phone: true,
                driverProfile: { select: { status: true } },
              },
            },
          },
        },
      },
    });

    //Если транспорт не найден
    if (!vehicle) return redirect('/');

    //Проверка прав доступа для водителя
    if (role === 'Driver') {
      const isDriverAssociated = vehicle.vehicleDrivers.some((vd) => vd.driver.uuid === userUuid);

      if (!isDriverAssociated) {
        return redirect('/');
      }
    }

    //Форматирование данных для компонента
    const detailVehicleData = {
      ...vehicle,
      drivers: vehicle.vehicleDrivers.map((vd) => ({
        assignmentUuid: vd.uuid,
        assignmentDate: vd.assignmentDate,
        userUuid: vd.driver.uuid,
        fullName: vd.driver.fullName,
        phone: vd.driver.phone,
        status: vd.driver.driverProfile?.status,
      })),
    };

    return <VehiclesDetail data={detailVehicleData} />;
  } catch (error) {
    console.error('Vehicle detail page error:', error);
    return redirect('/');
  }
};

export default Page;
