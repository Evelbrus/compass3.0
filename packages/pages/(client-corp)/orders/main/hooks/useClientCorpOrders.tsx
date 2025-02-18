//@pages/(driver)/orders/main/hooks/useDriverOrders.ts

import { useState, useEffect } from 'react';
import { OrderStatus } from '@prisma/client';
import { DetailOrderData } from '@shared/prisma/interface/orders/interface';

interface UseClientCorpOrdersProps {
  page: number;
  perPage: number;
  statusFilter: OrderStatus | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  updateFlag: number;
  updateURL: (newParams: { [key: string]: string | number | null }) => void;
}

interface UseClientCorpOrdersResult {
  orders: DetailOrderData[];
  loading: boolean;
  error: string | null;
  total: number;
  statusesCount: Record<string, number>;
}

const useClientCorpOrders = ({
  //Убрали corpId
  page,
  perPage,
  statusFilter,
  sortBy,
  sortOrder,
  updateFlag,
  updateURL,
}: UseClientCorpOrdersProps): UseClientCorpOrdersResult => {
  const [orders, setOrders] = useState<DetailOrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [statusesCount, setStatusesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/client-corp/orders', window.location.origin);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('per_page', perPage.toString());
        if (statusFilter) {
          url.searchParams.append('status', statusFilter);
        }
        url.searchParams.append('sort_by', sortBy);
        url.searchParams.append('sort_order', sortOrder);

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrders(data.orders);
        setTotal(data.total);
        const statusesCountData: Record<string, number> = {};
        data.statusesCount.forEach((item: { status: OrderStatus; _count: { status: number } }) => {
          statusesCountData[item.status] = item._count.status;
        });
        setStatusesCount(statusesCountData);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    updateURL({ page, status: statusFilter, sortBy, sortOrder });
  }, [page, perPage, statusFilter, sortBy, sortOrder, updateFlag, updateURL]);

  return { orders, loading, error, total, statusesCount };
};

export default useClientCorpOrders;
