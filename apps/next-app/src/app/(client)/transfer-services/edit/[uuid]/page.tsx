import React from 'react';
import { redirect } from 'next/navigation';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { PrismaClient } from '@prisma/client';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';
import VehiclesEdit from '@pages/(client)/vehicles/VehiclesEdit';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    uuid: string;
  };
}

export const revalidate = 60;

const Page = async ({ params }: PageProps) => {
  const { role } = await getLayoutData();
  const { uuid } = params;

  if (role !== 'Admin' && role !== 'Operator') {
    return redirect('/');
  }

  //Получаем данные автомобиля и связанные данные с сервера
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
      service_levels: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!vehicle) {
    return redirect('/');
  }

  //Преобразуем данные в формат DetailVehicleData
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
    service_levels: vehicle.service_levels.map((level) => ({
      uuid: level.uuid,
      service: {
        uuid: level.service.uuid,
        name: level.service.name,
        serviceType: level.service.serviceType,
        price: level.service.price,
      },
    })),
  };

  console.log('detailVehicleData', detailVehicleData);

  return <VehiclesEdit data={detailVehicleData} />;
};

export default Page;
