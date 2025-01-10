'use client';

import React, { useEffect, useState } from 'react';
import { AdditionalService, Tariff } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CheckIcon, CloseIcon } from '@shared/components/ui/icon';

interface AdditionalServiceWithDetails extends Omit<AdditionalService, 'createdAt' | 'updatedAt'> {}

interface TariffWithServices extends Tariff {
  tariffAdditionalServices: {
    service: AdditionalServiceWithDetails;
    price: number;
    isAvailable: boolean;
  }[];
}

const AdditionalServicesTable: React.FC = () => {
  const [tariffs, setTariffs] = useState<TariffWithServices[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState<boolean>(true);
  const [tariffsError, setTariffsError] = useState<string | null>(null);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [additionalServicesError, setAdditionalServicesError] = useState<string | null>(null);
  const [selectedTariffUuid, setSelectedTariffUuid] = useState<string | null>(null);

  //Загружаем тарифы при монтировании
  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const response = await fetch('/api/tariffs?page=1&per_page=100');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status !== 'success') {
          throw new Error(data.message || 'Failed to fetch tariffs');
        }
        setTariffs(data.data.tariffs);
      } catch (error) {
        console.error('Ошибка при получении тарифов:', error);
        setTariffsError('Ошибка при получении тарифов');
      } finally {
        setTariffsLoading(false);
      }
    };

    fetchTariffs();
  }, []);

  //Загружаем все доступные услуги
  useEffect(() => {
    const fetchAdditionalServices = async () => {
      try {
        const response = await fetch('/api/additional-services?page=1&per_page=100');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAdditionalServices(data.data.additionalServices);
      } catch (error) {
        console.error('Ошибка при получении услуг:', error);
        setAdditionalServicesError('Ошибка при получении услуг');
      }
    };

    fetchAdditionalServices();
  }, []);

  if (tariffsLoading) {
    return <p>Загрузка тарифов...</p>;
  }

  if (tariffsError) {
    return <p className="text-red-500">Ошибка загрузки тарифов: {tariffsError}</p>;
  }

  if (additionalServicesError) {
    return <p className="text-red-500">Ошибка загрузки услуг: {additionalServicesError}</p>;
  }

  //Найти активные услуги для выбранного тарифа
  const selectedTariff = tariffs.find((tariff) => tariff.uuid === selectedTariffUuid);
  const activeServices = selectedTariff?.tariffAdditionalServices || [];

  return (
    <AnimatedComponent duration={500}>
      <div className="w-full">
        {/*Кнопки для выбора тарифа */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tariffs.map((tariff) => (
            <button
              key={tariff.uuid}
              onClick={() => setSelectedTariffUuid(tariff.uuid)}
              className={`px-4 py-2 rounded ${
                tariff.uuid === selectedTariffUuid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tariff.name}
            </button>
          ))}
        </div>

        {/*Таблица для всех услуг */}
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
                  //Проверяем, активна ли услуга для текущего тарифа
                  const activeService = activeServices.find(
                    (active) => active.service.uuid === service.uuid,
                  );

                  return (
                    <tr key={service.uuid} className="text-center">
                      <td className="px-4 py-2 border text-left">{service.name}</td>
                      <td className="px-4 py-2 border">
                        {activeService ? `${activeService.price}₽` : 'Недоступно'}
                      </td>
                      <td className="px-4 py-2 border">
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
