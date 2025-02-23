import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import TariffForm from '@pages/(administrator)/tariff/TariffForm';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { JSX } from 'react';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const TariffEditPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();
  //Ожидаем разрешения промиса params
  const resolvedParams = await params;
  const { uuid } = resolvedParams;

  if (refreshToken) {
    if (role === UserRole.Admin || role === UserRole.Operator) {
      const tariff = await prisma.tariff.findUnique({
        where: { uuid },
        include: {
          tariffAdditionalServices: {
            include: {
              service: true,
            },
          },
        },
      });

      if (!tariff) {
        return <Loading />;
      }

      const tariffData: DetailTariffData = {
        ...tariff,
        tariffAdditionalServices: tariff.tariffAdditionalServices.map((serviceRelation) => ({
          uuid: serviceRelation.uuid,
          service: serviceRelation.service,
          serviceUuid: serviceRelation.serviceUuid,
          price: serviceRelation.price,
          isAvailable: serviceRelation.isAvailable,
          createdAt: serviceRelation.createdAt,
          updatedAt: serviceRelation.updatedAt,
        })),
      };

      return <TariffForm initialData={tariffData} mode="edit" />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default TariffEditPage;
