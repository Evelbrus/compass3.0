'use client';

import React, { useEffect, useState, JSX, useTransition, useCallback } from 'react';
import { OrderStatus } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ITable, TableOrdersRow } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import Filters from '@widgets/filters/ui/Filters';
import { renderOrderDriverActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag, openModal, View } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { ordersClientCorpColumns } from '@pages/(client-corp)/orders/main/ordersClientCorpColumns';
import { ordersClientCorpOverview } from '@pages/(client-corp)/orders/main/ordersClientCorpOverview';
import useClientCorpOrders from '@pages/(client-corp)/orders/main/hooks/useClientCorpOrders';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';

const OrderClientCorpPage = (): JSX.Element => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [perPage, setPerPage] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(
    (searchParams.get('status') as OrderStatus) || 'PENDING',
  );
  const [sortBy, setSortBy] = useState<keyof TableOrdersRow>(
    (searchParams.get('sortBy') as keyof TableOrdersRow) || 'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  );

  const [view, setView] = useState<View>('skeleton');
  const [isPending, startTransition] = useTransition();
  const [optimisticPage, setOptimisticPage] = useState(page);

  const updateFlag = useUnit($updateFlag);

  const updateURL = useCallback(
    (newParams: { [key: string]: string | number | null }) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(newParams)) {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value.toString());
        }
      }
      router.push(`?${newSearchParams.toString()}`);
    },
    [router, searchParams],
  );

  const { orders, loading, error, total, statusesCount } = useClientCorpOrders({
    page,
    perPage,
    statusFilter,
    sortBy: sortBy as string,
    sortOrder,
    updateFlag,
    updateURL,
  });

  useEffect(() => {
    if (error) {
      setView('error');
    } else if (loading && view !== 'skeleton') {
      setView('loading');
    } else if (!loading && orders.length > 0) {
      setView('data');
    } else if (!loading && orders.length === 0) {
      setView('noData');
    } else if (loading) {
      setView('loading');
    }
  }, [loading, error, orders, view]);

  const handlePageChange = useCallback(
    (page: number) => {
      startTransition(() => {
        setOptimisticPage(page);
        setPage(page);
        updateURL({ page });
      });
    },
    [updateURL],
  );

  const handleSort = useCallback(
    (sortByKey: keyof TableOrdersRow | null, sortDirection: 'asc' | 'desc') => {
      startTransition(() => {
        setSortBy(sortByKey ?? 'createdAt');
        setSortOrder(sortDirection);
        updateURL({ sortBy: sortByKey ?? 'createdAt', sortOrder });
      });
    },
    [updateURL],
  );

  const handleCreate = () => {
    openModal('createClientCorpOrder');
  };

  const tableData: TableOrdersRow[] = orders.map((order, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    createdBy: {
      fullName: order.createdBy.fullName,
      phone: order.createdBy.phone,
    },
    tariff: {
      name: order.tariff.name,
    },
    departurePoint: {
      address: order.departurePoint.address,
    },
    arrivalPoint: {
      address: order.arrivalPoint.address,
    },
    status: orderStatusTranslations[order.status],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    basePrice: parseFloat(order.basePrice.toString()),
    actions: renderOrderDriverActions({ entity: 'orders', uuid: order.uuid }),
  }));

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-6">Ваш список заказов</h1>
        <div className="flex flex-row gap-2">
          <IButton
            onClick={handleCreate}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]
                    text-white font-semibold transition duration-300 ease-in-out
                    hover:bg-[color:var(--button-secondary-hover)]"
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
        onSelectStatus={(status) => setStatusFilter(status as OrderStatus)}
        statusOverview={ordersClientCorpOverview}
      />

      <>
        {view === 'skeleton' && <SkeletonTable columns={ordersClientCorpColumns} rows={perPage} />}
        {view === 'loading' || isPending ? (
          <></>
        ) : view === 'data' ? (
          <AnimatedComponent duration={500} className="w-full">
            <ITable<TableOrdersRow>
              data={tableData}
              columns={ordersClientCorpColumns}
              sortBy={sortBy}
              sortDirection={sortOrder}
              onSort={handleSort}
            />
          </AnimatedComponent>
        ) : view === 'error' ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <NoData />
        )}

        {total > perPage && (
          <Pagination
            pageNumber={optimisticPage}
            pageSize={perPage}
            totalCount={total}
            setPageNumber={handlePageChange}
          />
        )}
      </>
    </AnimatedComponent>
  );
};

export default OrderClientCorpPage;
