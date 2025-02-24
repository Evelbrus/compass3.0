'use client';

import React from 'react';
import { ITable, TableOrdersRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { ordersClientCorpColumns } from '@features/orders/table/table/columns/ordersClientCorpColumns';


interface OrderTableProps {
  orders: TableOrdersRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TableOrdersRow | null;
  sortOrder: 'asc' | 'desc' | undefined;
  handleSort: (sortBy: keyof TableOrdersRow | null, sortOrder: 'asc' | 'desc' | undefined) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
                                                 orders,
                                                 loading,
                                                 error,
                                                 sortBy,
                                                 sortOrder,
                                                 handleSort,
                                               }) => {
  if (loading) return <SkeletonTable columns={ordersClientCorpColumns} rows={10} />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (orders.length === 0) return <NoData />;

  return (
    <ITable
      data={orders}
      columns={ordersClientCorpColumns}
      sortBy={sortBy}
      sortDirection={sortOrder}
      onSort={handleSort}
    />
  );
};

export default OrderTable;