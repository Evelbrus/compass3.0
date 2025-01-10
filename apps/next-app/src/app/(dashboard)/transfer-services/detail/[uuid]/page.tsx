import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { PrismaClient } from '@prisma/client';
import VehiclesDetail from '@pages/(administrator)/vehicles/VehiclesDetail';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page: React.FC<PageProps> = async ({ params }) => {
  const { role } = await getLayoutData();
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

  if (role !== 'Admin' && role !== 'Operator') {
    return redirect('/');
  }

  //Получаем данные автомобиля
  const vehicle = await prisma.vehicle.findUnique({
    where: { uuid },
    include: {
      vehicleDrivers: {
        include: {
          driver: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!vehicle) {
    return redirect('/');
  }

  //Преобразование данных в формат DetailVehicleData
  const detailVehicleData: DetailVehicleData = {
    ...vehicle,
    vehicleDrivers: vehicle.vehicleDrivers.map((driver) => ({
      ...driver,
      driver: {
        uuid: driver.driver.uuid,
        user: {
          fullName: driver.driver.user!.fullName,
          phone: driver.driver.user!.phone,
        },
      },
    })),
  };

  return <VehiclesDetail data={detailVehicleData} />;
};

export default Page;
