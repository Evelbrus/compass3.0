'use client';

import React, { useRef, useTransition } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Filters from '@widgets/filters/ui/Filters';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import useOrdersDriver from '@features/orders/hooks/useOrdersDriver';
import OrderDriverTable from '@features/orders/table/table/OrderDriverTable';
import { ordersDriverOverview } from '@entities/orders/ordersDriverOverview';


const OrderDriverPage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);
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
    handlePageChange,
    handleSort,
    handleStatusFilterChange,
  } = useOrdersDriver();

  useURLParams({ optimisticPage, statusFilter, sortBy, sortOrder });

  const handlePageChangeWithScroll = (newPage: number) => {
    startTransition(() => {
      handlePageChange(newPage);
      if (topRef.current) {
        topRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center px-5">
        <h1 className="text-2xl font-extrabold leading-6">Список заказов (Водитель)</h1>
        <div className="flex flex-row gap-2">
          <Filters />
        </div>
      </div>

      <StatusOverview
        selectedStatus={statusFilter}
        statusCounts={statusesCount}
        onSelectStatus={handleStatusFilterChange}
        statusOverview={ordersDriverOverview}
      />

      <OrderDriverTable
        orders={orders}
        loading={loading || isPending}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />

      {total > perPage && (
        <PaginationComponent
          pageNumber={optimisticPage}
          pageSize={perPage}
          totalCount={total}
          setPageNumber={handlePageChangeWithScroll}
        />
      )}
    </AnimatedComponent>
  );
};

export default OrderDriverPage;