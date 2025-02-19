import { jsx as _jsx } from "react/jsx-runtime";
import { ITable } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { additionalServicesColumns } from '@features/additional-service/table/columns/additionalServicesColumns';
const AdditionalServicesTable = ({ additionalServices, loading, error, sortBy, sortOrder, handleSort, }) => {
    return (_jsx("div", { children: loading ? (_jsx(SkeletonTable, { columns: additionalServicesColumns, rows: 10 })) : error ? (_jsx("div", { className: "text-red-500", children: error })) : additionalServices.length === 0 ? (_jsx(NoData, {})) : (_jsx(ITable, { data: additionalServices, columns: additionalServicesColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort })) }));
};
export default AdditionalServicesTable;
