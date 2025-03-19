import { useState, useEffect, useCallback } from 'react';
import { OrderStatus } from '@prisma/client';
import { TableOrdersRow } from '@shared/components/ui/table';
import { renderOrdersActions } from '@shared/components/ui/table/ui/TableRenders';
import { useRouter, useSearchParams } from 'next/navigation';
import { DetailOrderData } from '@shared/prisma/interface/orders/interface';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import { useUnit } from 'effector-react';
import { $updateFlag } from '@shared/lib/effector/state/state';
import { checkAndHandleRedirect } from '@shared/api'; // Добавляем импорт

// Константа для статуса по умолчанию
const DEFAULT_STATUS = 'PENDING' as OrderStatus;

const useOrders = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateFlag = useUnit($updateFlag);

  const statusFromUrl = searchParams.get('status') as OrderStatus | null;
  const initialStatus = statusFromUrl || DEFAULT_STATUS;

  const [orders, setOrders] = useState<DetailOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [optimisticPage, setOptimisticPage] = useState<number>(page);
  const [sortBy, setSortBy] = useState<keyof TableOrdersRow | null>(
    (searchParams.get('sort_by') as keyof TableOrdersRow) || 'departureTime',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  );

  const [statusFilter, setStatusFilter] = useState<OrderStatus>(initialStatus);

  const [total, setTotal] = useState(0);
  const [statusesCount, setStatusesCount] = useState<Record<string, number>>({});
  const [availableStatuses, setAvailableStatuses] = useState<OrderStatus[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/orders', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      url.searchParams.append('status', statusFilter);
      if (sortBy !== null) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }
      url.searchParams.append('role', 'Driver');

      const response = await fetch(url.toString());
      if (!response.ok) {
        const data = await response.json();
        if (checkAndHandleRedirect(data)) {
          setOrders([]); // Очищаем заказы при редиректе
          setTotal(0);
          return; // Прерываем выполнение после редиректа
        }
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotal(data.total);

      const statusesArray: OrderStatus[] = [];
      const statusesCountData: Record<string, number> = {};

      data.statusesCount.forEach((item: { status: OrderStatus; _count: { status: number } }) => {
        statusesCountData[item.status] = item._count.status;
        statusesArray.push(item.status);
      });

      setStatusesCount(statusesCountData);
      setAvailableStatuses(statusesArray);

      if (statusesCountData[statusFilter] === 0) {
        const firstAvailableStatus = data.statusesCount.find(
          (item: { status: OrderStatus; _count: { status: number } }) => item._count.status > 0,
        );

        if (firstAvailableStatus) {
          setStatusFilter(firstAvailableStatus.status);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleStatusFilterChange = (newStatus: OrderStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    setOptimisticPage(1);
  };

  const tableData: TableOrdersRow[] = orders.map((order, index) => ({
    orderNumber: order.orderNumber,
    clientBy: {
      fullName: order.clientBy.fullName,
      phone: order.clientBy.phone,
      role: order.clientBy.role,
      companyProfile: {
        companyName: order.clientBy.companyProfile?.companyName,
        companyPhone: order.clientBy.companyProfile?.companyPhone,
        companyLogo: order.clientBy.companyProfile?.companyLogo,
      },
    },
    assignedDriver: order.assignedDriver
      ? {
          fullname: order.assignedDriver.fullName,
          phone: order.assignedDriver.phone,
        }
      : {
          fullname: 'Не назначен',
          phone: '—',
        },
    plateNumber: order.plateNumber || undefined,
    tariff: {
      name: order.tariff.name,
      vehicleType: order.tariff.vehicleType,
      serviceLevel: order.tariff.serviceLevel,
    },
    driverAcceptanceStatus: order.driverAcceptanceStatus,
    departurePoint: {
      address: order.departurePoint.address,
    },
    arrivalPoint: {
      address: order.arrivalPoint.address,
    },
    status: orderStatusTranslations[order.status],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    departureTime: order.departureTime,
    basePrice: parseFloat(order.basePrice.toString()),
    actions: renderOrdersActions({
      entity: 'orders',
      uuid: order.uuid,
      navigate: router.push,
    }),
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
    availableStatuses,
    handleStatusFilterChange,
    handlePageChange,
    handleSort,
  };
};

export default useOrders;
