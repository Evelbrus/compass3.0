'use client';

import React, { useEffect, useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import PointsTable from '@features/points/table/PointsTable';
import usePoints from '@features/points/hooks/usePoints';

const Points = ({
  activeTab,
  reset,
  setReset,
}: {
  activeTab: string;
  reset: boolean;
  setReset: (reset: boolean) => void;
}) => {
  const topRef = useRef<HTMLDivElement>(null);

  //Получаем данные из хука
  const {
    points,
    loading,
    error,
    total,
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
  } = usePoints();

  //Синхронизируем параметры с URL
  useURLParams({ optimisticPage, sortBy, sortOrder, reset, activeTab });

  useEffect(() => {
    if (reset) {
      //Когда reset равен true, сбрасываем страницу на 1 и очищаем reset
      handlePageChange(1);
      setReset(false);
    }
  }, [reset, setReset, handlePageChange]);

  //Обработчик смены страницы с плавным скроллом вверх
  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Точки</h1>
        <IButton onClick={() => openModal('createPointModal')}>Добавить точку</IButton>
      </div>

      <PointsTable
        points={points}
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

export default Points;
