import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import TariffForm from '@pages/(administrator)/tariff/TariffFormPage';
import Loading from '@entities/loading/loading';
import { UserRole, Tariff, TariffOnService } from '@prisma/client';
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
  // Ожидаем разрешения промиса params
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

      // Преобразуем данные в нужный формат, соответствующий ожидаемому типу в TariffFormPage
      const formattedTariff: Tariff & { tariffAdditionalServices: TariffOnService[] } = {
        // Базовые поля из тарифа
        uuid: tariff.uuid,
        name: tariff.name,
        description: tariff.description,
        price: tariff.price,
        serviceLevel: tariff.serviceLevel,
        vehicleType: tariff.vehicleType,
        freeWaitTimeBishkek: tariff.freeWaitTimeBishkek,
        pricePerMinuteAfterBishkek: tariff.pricePerMinuteAfterBishkek,
        freeWaitTimeAirport: tariff.freeWaitTimeAirport,
        pricePerMinuteAfterAirport: tariff.pricePerMinuteAfterAirport,
        createdAt: tariff.createdAt,
        updatedAt: tariff.updatedAt,

        // Преобразуем массив tariffAdditionalServices в нужный формат
        tariffAdditionalServices: tariff.tariffAdditionalServices.map((relation) => ({
          uuid: relation.uuid,
          tariffUuid: relation.tariffUuid,
          serviceUuid: relation.serviceUuid,
          price: relation.price,
          isAvailable: relation.isAvailable,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        })),
      };

      return <TariffForm tariffData={formattedTariff} mode="edit" />;
    } else {
      return <Loading />;
    }
  } else {
    redirect(publicRoutes.LOGIN);
  }
};

export default TariffEditPage;
