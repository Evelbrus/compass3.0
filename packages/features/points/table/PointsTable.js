import { jsx as _jsx } from "react/jsx-runtime";
import { ITable } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { pointsColumns } from '@features/points/table/columns/pointsColumns';
const PointsTable = ({ points, loading, error, sortBy, sortOrder, handleSort, }) => {
    if (loading)
        return _jsx(SkeletonTable, { columns: pointsColumns, rows: 10 });
    if (error)
        return _jsx("div", { className: "text-red-500", children: error });
    if (points.length === 0)
        return _jsx(NoData, {});
    return (_jsx(ITable, { data: points, columns: pointsColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort }));
};
export default PointsTable;
