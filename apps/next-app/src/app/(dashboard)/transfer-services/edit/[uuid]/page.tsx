import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';
import VehiclesEdit from '@pages/(administrator)/vehicles/VehiclesEdit';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';

interface PageProps {
  params: { uuid: string };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role } = await getLayoutData();
  const { uuid } = params;

  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

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
};

export default Page;
