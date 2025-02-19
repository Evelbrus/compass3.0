'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ITable } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { ordersColumns } from '@features/orders/table/table/columns/ordersColumns';
const OrderTable = ({ orders, loading, error, sortBy, sortOrder, handleSort, }) => {
    if (loading)
        return _jsx(SkeletonTable, { columns: ordersColumns, rows: 10 });
    if (error)
        return _jsx("div", { className: "text-red-500", children: error });
    if (orders.length === 0)
        return _jsx(NoData, {});
    return (_jsx(ITable, { data: orders, columns: ordersColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort }));
};
export default OrderTable;
