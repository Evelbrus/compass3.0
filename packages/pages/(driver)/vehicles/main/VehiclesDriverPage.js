'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useTransition, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { $updateFlag } from '@shared/lib/effector/state/state';
import { ITable } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import Pagination from '@shared/components/ui/pagination/Pagination';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import NoData from '@shared/components/errors/noData';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { useVehiclesData } from '@pages/(driver)/vehicles/main/useVehiclesData';
import { vehicleColumns } from '@pages/(driver)/vehicles/main/vehicleColums';
import { mapVehiclesToTableData } from '@pages/(driver)/vehicles/main/tableDataUtils';
import { vehicleTypesOverview } from '@pages/(driver)/vehicles/main/vehicleTypesOverview';
const VehiclesDriverPage = () => {
    const [isPending, startTransition] = useTransition();
    const updateFlag = useUnit($updateFlag);
    const router = useRouter();
    const [view, setView] = useState('skeleton');
    const [optimisticPage, setOptimisticPage] = useState(1);
    const { vehicles, loading, error, page, perPage, total, vehicleTypeFilter, vehicleTypeCounts, sortBy, sortOrder, setPage, setVehicleTypeFilter, setSortBy, setSortOrder, fetchVehicles, } = useVehiclesData();
    const fetchData = useCallback(async () => {
        try {
            await fetchVehicles();
        }
        catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }, [fetchVehicles]);
    useEffect(() => {
        startTransition(() => {
            fetchData();
        });
    }, [page, vehicleTypeFilter, sortBy, sortOrder, updateFlag, fetchData]);
    useEffect(() => {
        if (error) {
            setView('error');
        }
        else if (loading && view !== 'skeleton') {
            setView('loading');
        }
        else if (!loading && vehicles.length > 0) {
            setView('data');
        }
        else if (!loading && vehicles.length === 0) {
            setView('noData');
        }
    }, [loading, error, vehicles, view]);
    const handlePageChange = (newPage) => {
        startTransition(() => {
            setOptimisticPage(newPage);
            setPage(newPage);
        });
    };
    const handleSort = useCallback((sortByKey, sortDirection) => {
        startTransition(() => {
            setSortBy(sortByKey ?? 'createdAt');
            setSortOrder(sortDirection);
        });
    }, [setSortBy, setSortOrder]);
    const handleFilterChange = (status) => {
        startTransition(() => {
            setVehicleTypeFilter(status);
            setPage(1);
        });
    };
    const tableData = mapVehiclesToTableData(vehicles, optimisticPage, perPage, router.push);
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u041C\u043E\u0438 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430" }), _jsx(StatusOverview, { selectedStatus: vehicleTypeFilter, statusCounts: vehicleTypeCounts, onSelectStatus: handleFilterChange, statusOverview: vehicleTypesOverview }), _jsxs(_Fragment, { children: [view === 'skeleton' && _jsx(SkeletonTable, { columns: vehicleColumns, rows: perPage }), view === 'data' ? (_jsx(AnimatedComponent, { duration: 500, className: "w-full", children: _jsx(ITable, { data: tableData, columns: vehicleColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort }) })) : view === 'error' ? (_jsx("div", { className: "text-red-500 mb-4", children: error })) : (_jsx(NoData, {})), total > perPage && (_jsx(Pagination, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChange }))] })] }));
};
export default VehiclesDriverPage;
