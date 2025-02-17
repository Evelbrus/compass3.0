import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { prisma } from '@shared/prisma/prisma-client';
import VehiclesDetail from '@pages/(administrator)/vehicles/VehiclesDetail';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { publicRoutes } from '@shared/utils/routing';
import { omit } from 'next/dist/shared/lib/router/utils/omit';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 10;

const Page: React.FC<PageProps> = async ({ params }) => {
  try {
    const { role, userSession, refreshToken } = await getLayoutData();
    const resolvedParams = await params;
    const { uuid } = resolvedParams;

    if (refreshToken) {
      //Проверка авторизации и роли
      if (role !== UserRole.Admin && role !== UserRole.Operator && role !== UserRole.Driver) {
        return <Loading />;
      }

      //Проверка наличия профиля пользователя
      const userUuid = userSession?.uuid;
      if (!userUuid) return <Loading />;

      const vehicle = await prisma.vehicle.findUnique({
        where: { uuid },
        include: {
          vehicleDrivers: {
            include: {
              driver: true,
            },
          },
        },
      });

      //Если транспорт не найден
      if (!vehicle) return <Loading />;

      //Проверка прав доступа для водителя
      if (role === UserRole.Driver) {
        const isDriverAssociated = vehicle.vehicleDrivers.some((vd) => vd.driver.uuid === userUuid);
        if (!isDriverAssociated) {
          return <Loading />;
        }
      }

      //Форматирование данных для компонента
      const detailVehicleData = {
        ...vehicle,
        photoRegistrationCertificate: vehicle.photoRegistrationCertificate || null,
        vehicleDrivers: vehicle.vehicleDrivers.map((vd) => ({
          ...vd,
          driver: omit(vd.driver, ['password', 'refreshTokens']),
        })),
      };

      return <VehiclesDetail data={detailVehicleData} />;
    } else {
      redirect(publicRoutes.LOGIN);
    }
  } catch (error) {
    console.error('Vehicle detail page error:', error);
    return <Loading />;
  }
};

export default Page;
