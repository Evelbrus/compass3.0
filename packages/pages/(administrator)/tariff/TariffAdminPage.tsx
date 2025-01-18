'use client';

import React, { useEffect, useState, useRef, JSX, useCallback } from 'react';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import Tariff from '@widgets/tarrif/ui/Tariff';
import TariffTypes from '@widgets/tarrif/ui/TariffTypes';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';
import AdditionalServicesTable from '@widgets/additional-service/ui/AdditionalServicesTable';

import { AdditionalService } from '@prisma/client';

type TStatus = 'loading' | 'success' | 'error';

const TariffAdminPage = (): JSX.Element => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [tariffs, setTariffs] = useState<DetailTariffData[]>([]);
  const [statusTariffs, setStatusTariffs] = useState<TStatus>('success');
  const [selectedTariff, setSelectedTariff] = useState<DetailTariffData>();

  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [statusadditionalServices, setStatusAdditionalServices] = useState<TStatus>('success');

  const handleSelectTariff = useCallback((tariff: DetailTariffData) => {
    setSelectedTariff(tariff);
  }, []);

  const fetchTariffs = async () => {
    try {
      setStatusTariffs('loading');
      const response = await fetch(`/api/tariffs`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch tariffs');
      }
      setTariffs(data.data.tariffs);
      setSelectedTariff(data.data.tariffs[0]);
      setStatusTariffs('success');
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      setStatusTariffs('error');
    }
  };

  const fetchAdditionalServices = async () => {
    try {
      setStatusAdditionalServices('loading');
      const response = await fetch('/api/additional-services');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAdditionalServices(data.data.additionalServices);
      setStatusAdditionalServices('success');
    } catch (error) {
      console.error('Ошибка при получении услуг:', error);
      setStatusAdditionalServices('error');
    }
  };

  useEffect(() => {
    fetchTariffs();
    fetchAdditionalServices();
  }, []);

  const handleCreate = () => {
    router.push(privateRoutes.TARIFFCREATEMANAGEMENT);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && scrollRef.current) {
      scrollRef.current.scrollLeft -= event.movementX;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  console.log(selectedTariff);

  return (
    <AnimatedComponent duration={500}>
      <div className="min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-[40px] leading-6 content-center font-bold">Тарифы</h1>
          <IButton
            onClick={handleCreate}
            className="w-[200px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]
                  text-white font-semibold transition duration-300 ease-in-out
                  hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-4 leading-4 text-medium justify-center"
          >
            Создать тариф
          </IButton>
        </div>

        {selectedTariff ? <Tariff data={selectedTariff} /> : <p>No tariff selected</p>}

        {statusTariffs === 'loading' && <p>Загрузка тарифов...</p>}
        {statusTariffs === 'error' && (
          <p className="text-red-500">Ошибка: Error fetching tariffs</p>
        )}
        <div
          className="w-full overflow-x-auto custom-scroll cursor-grab no-select"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex flex-row gap-4 w-full p-3 max-w-[1200px] whitespace-nowrap">
            {tariffs.map((tariff) => (
              <TariffTypes
                key={tariff.uuid}
                tariff={tariff}
                onSelectTariff={handleSelectTariff}
                selectedTariff={selectedTariff}
              />
            ))}
          </div>
        </div>
        <AdditionalServicesTable
          statusTariffs={statusTariffs}
          additionalServices={additionalServices}
          statusadditionalServices={statusadditionalServices}
          selectedTariff={selectedTariff}
        />
      </div>
    </AnimatedComponent>
  );
};

export default TariffAdminPage;
