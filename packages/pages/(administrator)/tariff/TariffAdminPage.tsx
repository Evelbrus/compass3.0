'use client';

import React, { useEffect, useState, useRef, JSX } from 'react';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import Tariff from '@widgets/tarrif/ui/Tariff';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';
import AdditionalServicesTable from '@widgets/additional-service/ui/AdditionalServicesTable';

const TariffAdminPage = (): JSX.Element => {
  const [tariffs, setTariffs] = useState<DetailTariffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalAllTariffs, setTotalAllTariffs] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const response = await fetch(`/api/tariffs?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.status !== 'success') {
          throw new Error(data.message || 'Failed to fetch tariffs');
        }
        setTariffs(data.data.tariffs);
        setTotal(data.data.total);
        setTotalAllTariffs(data.data.totalAllTariffs);
      } catch (error) {
        console.error('Error fetching tariffs:', error);
        setError('Error fetching tariffs');
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [page, perPage]);

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

  return (
    <AnimatedComponent duration={500}>
      <div className={'min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4'}>
        <div className={'flex flex-row justify-between'}>
          <h1 className={'text-[40px] leading-6 content-center font-bold'}>Тарифы</h1>
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
        {loading && <p>Загрузка тарифов...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        <div
          className="w-full overflow-x-auto custom-scroll cursor-grab no-select"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex flex-row gap-4 whitespace-nowrap max-w-[1200px] pb-4">
            {tariffs.map((tariff) => (
              <Tariff key={tariff.uuid} tariff={tariff} />
            ))}
          </div>
        </div>
        <AdditionalServicesTable />
      </div>
    </AnimatedComponent>
  );
};

export default TariffAdminPage;
