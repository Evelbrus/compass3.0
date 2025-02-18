'use client';

import React, { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import useDrivers from '@features/users/hooks/useDrivers';
import useURLParams from '@shared/utils/hooks/useURLParams';
import { privateRoutes } from '@shared/utils/routing';
import Filters from '@widgets/filters/ui/Filters';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import DriverTable from '@features/users/table/table/DriverTable';

const DriversAdminPage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    users,
    loading,
    error,
    total,
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
  } = useDrivers();

  //Update URL parameters
  useURLParams({ optimisticPage, sortBy, sortOrder });

  //Обработчик изменения страницы
  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);

    //Прокрутка к элементу после изменения страницы
    if (topRef.current) {
      topRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Список водителей (Админ вид)</h1>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => router.push(privateRoutes.USERDRIVERCREATE)}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]"
          >
            Добавить водителя
          </button>
        </div>
      </div>

      <Filters />

      <DriverTable
        users={users}
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

export default DriversAdminPage;
