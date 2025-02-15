import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { prisma } from '@shared/prisma/prisma-client';
import VehiclesDetail from '@pages/(administrator)/vehicles/VehiclesDetail';
import Loading from '@entities/loading/loading';
import { DriverProfile, UserRole } from '@prisma/client';
import { publicRoutes } from '@shared/utils/routing';

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
          photoRegistrationCertificate: true,
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
                  //Исправлено: вместо выбора несуществующего поля status выбираем весь профиль
                  driverProfile: true,
                },
              },
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
        //Если поле отсутствует, установим значение null
        photoRegistrationCertificate: vehicle.photoRegistrationCertificate || null,
        drivers: vehicle.vehicleDrivers.map((vd) => ({
          assignmentUuid: vd.uuid,
          assignmentDate: vd.assignmentDate,
          userUuid: vd.driver.uuid,
          fullName: vd.driver.fullName,
          phone: vd.driver.phone,
          //Если поле status необходимо, можно попробовать привести тип или оставить null.
          //Например, если вы ожидаете, что поле появится в будущем:
          status: vd.driver.driverProfile
            ? (vd.driver.driverProfile as DriverProfile) || null
            : null,
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
