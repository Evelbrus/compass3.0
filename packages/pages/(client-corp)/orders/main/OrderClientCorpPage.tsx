'use client';

import React, { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Filters from '@widgets/filters/ui/Filters';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import { ordersClientCorpOverview } from '@entities/orders/ordersClientCorpOverview';
import OrderClientCorpTable from '@features/orders/table/table/OrderClientCorpTable';
import useClientCorpOrders from '@features/orders/hooks/useClientCorpOrders';

const OrderClientCorpPage: React.FC = () => {
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
    handlePageChange,
    handleSort,
    handleStatusFilterChange,
  } = useClientCorpOrders();

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

  const handleCreate = () => {
    router.push('order/create');
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-end items-center px-5">
        <div className="flex flex-row gap-2">
          <IButton
            onClick={handleCreate}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-4 leading-4 text-medium justify-center"
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
        statusOverview={ordersClientCorpOverview}
      />

      <OrderClientCorpTable
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

export default OrderClientCorpPage;
