import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import TariffEdit from '@pages/(administrator)/tariff/TariffEditPage';
import Loading from '@entities/loading/loading';
import { UserRole } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import { JSX } from 'react';

interface PageProps {
  params: { uuid: string };
}

export const revalidate = 60;

const TariffEditPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { role, refreshToken } = await getLayoutData();
  const resolvedParams = await params;
  const { uuid } = await resolvedParams;

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
          service: {
            ...serviceRelation.service,
          },
          price: serviceRelation.price,
          isAvailable: serviceRelation.isAvailable,
        })),
      };

      return <TariffEdit data={tariffData} />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default TariffEditPage;
