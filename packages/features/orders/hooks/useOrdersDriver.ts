'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderStatus, Order, User, Tariff, Point } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { TableOrdersRow } from '@shared/components/ui/table';
import { renderOrderDriverActions } from '@shared/components/ui/table/ui/TableRenders';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import { useUnit } from 'effector-react';
import { $updateFlag } from '@shared/lib/effector/state/state';

type OrderWithDetails = Order & {
  createdBy: User & {
    companyProfile: { companyName: string; companyPhone: string; companyLogo: string | null };
  };
  tariff: Tariff;
  departurePoint: Point;
  arrivalPoint: Point;
};

const useOrdersDriver = () => {
  const searchParams = useSearchParams();
  const updateFlag = useUnit($updateFlag);

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [optimisticPage, setOptimisticPage] = useState<number>(page);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(
    (searchParams.get('status') as OrderStatus) || 'all',
  );
  // Меняем sortBy на departureTime по умолчанию
  const [sortBy, setSortBy] = useState<keyof TableOrdersRow | null>('departureTime');
  // Устанавливаем sortOrder как asc по умолчанию
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('asc');
  const [total, setTotal] = useState(0);
  const [statusesCount, setStatusesCount] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/drivers/orders', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }
      if (sortBy) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }
      url.searchParams.append('role', 'Driver');

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setOrders(data.orders || []);
      setTotal(data.total);

      const statusesCountData: Record<string, number> = {};
      data.statusesCount.forEach((item: { status: OrderStatus; _count: { status: number } }) => {
        statusesCountData[item.status] = item._count.status;
      });
      setStatusesCount(statusesCountData);
    } catch (err) {
      console.error('Error fetching driver orders:', err);
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, updateFlag]);

  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TableOrdersRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection);
  };

  const handleStatusFilterChange = (newStatus: OrderStatus | 'all') => {
    setStatusFilter(newStatus);
    setPage(1);
    setOptimisticPage(1);
  };

  // Добавляем departureTime в tableData
  const tableData: TableOrdersRow[] = orders.map((order, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    createdBy: {
      fullName: order.createdBy.fullName || 'Не указано',
      phone: order.createdBy.phone || 'Не указано',
      role: order.createdBy.role,
      companyProfile: {
        companyName: order.createdBy.companyProfile?.companyName,
        companyPhone: order.createdBy.companyProfile?.companyPhone,
        companyLogo: order.createdBy.companyProfile?.companyLogo,
      },
    },
    tariff: {
      name: order.tariff.name,
      serviceLevel: order.tariff.serviceLevel,
      vehicleType: order.tariff.vehicleType,
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
    departureTime: order.departureTime, // Добавляем поле
    basePrice: parseFloat(order.basePrice.toString()),
    actions: renderOrderDriverActions({ entity: 'orders', uuid: order.uuid }),
  }));

  return {
    orders: tableData,
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
  };
};

export default useOrdersDriver;
