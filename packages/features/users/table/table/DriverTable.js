import { jsx as _jsx } from "react/jsx-runtime";
import { ITable } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { driversColumns } from '@features/users/table/table/columns/driverColums';
const DriverTable = ({ users, loading, error, sortBy, sortOrder, handleSort, }) => {
    return (_jsx("div", { children: loading ? (_jsx(SkeletonTable, { columns: driversColumns, rows: 10 })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : users.length === 0 ? (_jsx(NoData, {})) : (_jsx(ITable, { data: users, columns: driversColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort })) }));
};
export default DriverTable;
