'use client';

import React from 'react';
import { AdditionalService } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CheckIcon, CloseIcon } from '@shared/components/ui/icon';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

type TStatus = 'loading' | 'success' | 'error';

interface AdditionalServicesTableProps {
  statusTariffs: TStatus;
  additionalServices: AdditionalService[];
  statusadditionalServices: TStatus;
  selectedTariff: DetailTariffData | undefined;
}

const AdditionalServicesTable: React.FC<AdditionalServicesTableProps> = ({
  statusTariffs,
  additionalServices,
  statusadditionalServices,
  selectedTariff,
}) => {
  if (statusTariffs === 'loading' || statusadditionalServices === 'loading') {
    return (
      <div className="w-full">
        <Skeleton width={300} height={40} />
        <Skeleton width={300} height={40} />
        <Skeleton width={300} height={40} />
      </div>
    );
  }

  if (statusTariffs === 'error') {
    return <p className="text-red-500">Ошибка загрузки тарифов: Ошибка при получении тарифов</p>;
  }

  if (statusadditionalServices === 'error') {
    return <p className="text-red-500">Ошибка загрузки услуг: Ошибка при получении услуг</p>;
  }

  return (
    <AnimatedComponent duration={500}>
      <div className="w-full">
        {additionalServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Услуга</th>
                  <th className="px-4 py-2 border">Цена</th>
                  <th className="px-4 py-2 border">Доступность</th>
                </tr>
              </thead>
              <tbody>
                {additionalServices.map((service) => {
                  const activeService = selectedTariff?.tariffAdditionalServices?.find(
                    (active) => active.service.uuid === service.uuid,
                  );

                  return (
                    <tr key={service.uuid} className="text-center">
                      <td className="px-4 py-2 border text-left">{service.name}</td>
                      <td className="px-4 py-2 border">
                        {activeService ? `${activeService.price}₽` : 'Недоступно'}
                      </td>
                      <td className="px-4 py-2 border flex justify-center">
                        {activeService && activeService.isAvailable ? (
                          <CheckIcon className="text-green-500" />
                        ) : (
                          <CloseIcon className="text-red-500" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">Данные о дополнительных услугах отсутствуют.</p>
        )}
      </div>
    </AnimatedComponent>
  );
};

export default AdditionalServicesTable;
