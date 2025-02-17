import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import VehiclesForm from '@features/vehicles/ui/VehiclesForm';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import convertPrismaData from '@shared/prisma/utils/converterBigIntToString';
import { VehicleData } from '@features/vehicles/hooks/useVehiclesCreateForm';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { uuid } = await params;
  const { role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

  let vehicleData = null;
  try {
    vehicleData = await prisma.vehicle.findUnique({
      where: { uuid },
      include: {
        vehicleDrivers: {
          include: {
            driver: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных автомобиля:', error);
    return <Loading />;
  }

  if (!vehicleData) {
    return <Loading />;
  }

  const safeVehicleData: VehicleData = convertPrismaData(vehicleData);

  console.log('vehicleDataEdit', safeVehicleData);

  return <VehiclesForm mode="edit" vehicleData={safeVehicleData} />;
};

export default Page;
