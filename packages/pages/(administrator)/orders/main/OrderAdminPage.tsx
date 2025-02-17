'use client';

import React, { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Filters from '@widgets/filters/ui/Filters';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import useOrders from '@features/orders/hooks/useOrders';
import useURLParams from '@shared/utils/hooks/useURLParams';
import { privateRoutes } from '@shared/utils/routing';
import { ordersOverview } from '@entities/orders/ordersOverview';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import OrderTable from '@features/orders/table/table/OrderTable';

const OrderAdminPage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    orders,
    loading,
    error,
    total,
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    statusesCount,
    statusFilter,
    handleStatusFilterChange,
    handlePageChange,
    handleSort,
  } = useOrders();

  //Синхронизируем параметры с URL
  useURLParams({ optimisticPage, statusFilter, sortBy, sortOrder });

  //Обработчик изменения страницы
  const handlePageChangeWithScroll = (newPage: number) => {
    console.log('Changing page to:', newPage);
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
        <h1 className="text-2xl font-extrabold leading-4">Список заказов (Админ вид)</h1>
        <div className="flex flex-row gap-2">
          <IButton
            onClick={() => router.push(privateRoutes.ORDERCREATE)}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]"
          >
            Добавить заказ
          </IButton>
          <Filters />
        </div>
      </div>

      <StatusOverview
        selectedStatus={statusFilter}
        statusCounts={statusesCount}
        onSelectStatus={handleStatusFilterChange}
        statusOverview={ordersOverview}
      />

      <OrderTable
        orders={orders}
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

export default OrderAdminPage;
