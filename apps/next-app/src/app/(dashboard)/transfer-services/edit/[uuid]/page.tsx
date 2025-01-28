import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';
import VehiclesEdit from '@pages/(administrator)/vehicles/VehiclesEdit';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';

interface PageProps {
  params: { uuid: string };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();
  const resolvedParams = await params;
  const { uuid } = await resolvedParams;

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
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

      if (!vehicle) {
        return <Loading />;
      }

      const detailVehicleData: DetailVehicleData = {
        ...vehicle,
        vehicleDrivers: vehicle.vehicleDrivers.map((driverRelation) => ({
          uuid: driverRelation.uuid,
          assignmentDate: driverRelation.assignmentDate,
          driver: driverRelation.driver
            ? {
                uuid: driverRelation.driver.uuid,
                fullName: driverRelation.driver.fullName,
                phone: driverRelation.driver.phone,
              }
            : {
                uuid: 'default-uuid',
                fullName: 'Не назначен',
                phone: 'Не назначен',
              },
        })),
      };

      return <VehiclesEdit data={detailVehicleData} />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default Page;
