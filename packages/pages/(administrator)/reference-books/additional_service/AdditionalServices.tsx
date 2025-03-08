'use client';

import React, { useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import useAdditionalServices from '@features/additional-service/hooks/useAdditionalServices';
import AdditionalServicesTable from '@features/additional-service/table/AdditionalServicesTable';

const AdditionalServices = () => {
  const topRef = useRef<HTMLDivElement>(null);

  //Получаем данные из хука
  const {
    additionalServices,
    loading,
    error,
    total,
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
  } = useAdditionalServices();

  //Теперь используем хук useURLParams для обновления URL
  useURLParams({ optimisticPage, sortBy, sortOrder });

  //Обработчик изменения страницы с прокруткой вверх
  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center px-5">
        <h1 className="text-2xl font-extrabold leading-4">Дополнительные услуги</h1>
        <IButton onClick={() => openModal('createAdditionalServiceModal')}>Добавить услугу</IButton>
      </div>

      <AdditionalServicesTable
        additionalServices={additionalServices}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />

      <PaginationComponent
        pageNumber={optimisticPage}
        pageSize={perPage}
        totalCount={total}
        setPageNumber={handlePageChangeWithScroll}
      />
    </AnimatedComponent>
  );
};

export default AdditionalServices;
