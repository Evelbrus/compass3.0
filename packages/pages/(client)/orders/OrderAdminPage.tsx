'use client';

import React, { useEffect, useState, JSX, useTransition, useCallback } from 'react';
import { OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ITable, TableOrdersRow } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import Filters from '@widgets/filters/ui/Filters';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag, openModal, View } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import { DetailOrderData } from '@shared/prisma/interface/orders/interface';
import { ordersColumns } from '@pages/(client)/orders/ordersColumns';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { ordersOverview } from '@pages/(client)/orders/ordersOverview';
import { privateRoutes } from '@shared/utils/routing';

const OrderAdminPage = (): JSX.Element => {
  const [orders, setOrders] = useState<DetailOrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalAllOrders, setTotalAllOrders] = useState<number>(0);
  const [statusesCount, setStatusesCount] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>('PENDING');
  const [sortBy, setSortBy] = useState<keyof TableOrdersRow>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();
  const [view, setView] = useState<View>('skeleton');
  const [isPending, startTransition] = useTransition();
  const [optimisticPage, setOptimisticPage] = useState(page);

  const updateFlag = useUnit($updateFlag);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/orders', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      url.searchParams.append('sort_by', sortBy as string);
      url.searchParams.append('sort_order', sortOrder);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setOrders(data.orders);
      setTotal(data.total);
      setTotalAllOrders(data.totalAllOrders);
      const statusesCountData: Record<string, number> = {};
      data.statusesCount.forEach((item: { status: OrderStatus; _count: { status: number } }) => {
        statusesCountData[item.status] = item._count.status;
      });
      setStatusesCount(statusesCountData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, perPage, statusFilter, sortBy, sortOrder, updateFlag]);

  useEffect(() => {
    if (error) {
      setView('error');
    } else if (loading && view !== 'skeleton') {
      setView('loading');
    } else if (!loading && orders.length > 0) {
      setView('data');
    } else if (!loading && orders.length === 0) {
      setView('noData');
    }
  }, [loading, error, orders, view]);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setOptimisticPage(page);
      setPage(page);
    });
  }, []);

  const handleSort = useCallback(
    (sortByKey: keyof TableOrdersRow, sortDirection: 'asc' | 'desc') => {
      startTransition(() => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
      });
    },
    [],
  );

  const handleCreate = () => {
    router.push(privateRoutes.ORDERCREATE);
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
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    basePrice: parseFloat(order.basePrice.toString()),
    actions: renderActions('orders', order.uuid, router.push),
  }));

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Список заказов (Админ вид)</h1>
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
        statusOverview={ordersOverview}
      />

      <>
        {view === 'skeleton' && <SkeletonTable columns={ordersColumns} rows={perPage} />}
        {view === 'loading' || isPending ? (
          <></>
        ) : view === 'data' ? (
          <AnimatedComponent duration={500} className="w-full">
            <ITable<TableOrdersRow>
              data={tableData}
              columns={ordersColumns}
              sortBy={sortBy}
              sortDirection={sortOrder}
              onSort={handleSort}
              enableStatusFilter={false}
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

export default OrderAdminPage;
