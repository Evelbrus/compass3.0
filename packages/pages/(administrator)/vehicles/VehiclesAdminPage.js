'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useTransition } from 'react';
import Filters from '@widgets/filters/ui/Filters';
import { ITable } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import { vehicleColumns } from '@pages/(administrator)/vehicles/vehicleColums';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';
import { vehicleTypesOverview } from '@pages/(administrator)/vehicles/vehiclesOverview';
const VehiclesAdminPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalAllVehicles, setTotalAllVehicles] = useState(0);
    const [vehicleTypeCounts, setVehicleTypeCounts] = useState({});
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('asc');
    const [view, setView] = useState('skeleton');
    const [isPending, startTransition] = useTransition();
    const [optimisticPage, setOptimisticPage] = useState(page);
    const router = useRouter();
    const updateFlag = useUnit($updateFlag);
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL('/api/vehicles', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('per_page', perPage.toString());
            if (vehicleTypeFilter && vehicleTypeFilter !== 'all') {
                url.searchParams.append('vehicleType', vehicleTypeFilter);
            }
            url.searchParams.append('sort_by', sortBy);
            url.searchParams.append('sort_order', sortOrder);
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Сетевой ответ был неудачным');
            }
            const data = await response.json();
            setVehicles(data.data.vehicles || []);
            setTotal(data.data.total);
            setTotalAllVehicles(data.data.totalAllVehicles);
            const vehicleTypeCountsData = { all: data.data.totalAllVehicles };
            data.data.vehicleTypeCounts?.forEach((item) => {
                vehicleTypeCountsData[item.type] = item.count;
            });
            setVehicleTypeCounts(vehicleTypeCountsData);
        }
        catch (error) {
            console.error('Ошибка при получении транспортных средств:', error);
            setError('Ошибка при получении транспортных средств');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, vehicleTypeFilter, sortBy, sortOrder]);
    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles, updateFlag]);
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
        else if (loading) {
            setView('loading');
        }
    }, [loading, error, vehicles, view]);
    const handlePageChange = useCallback((page) => {
        startTransition(() => {
            setOptimisticPage(page);
            setPage(page);
        });
    }, []);
    const handleSort = useCallback((sortByKey, sortDirection) => {
        startTransition(() => {
            setSortBy(sortByKey ?? 'createdAt');
            setSortOrder(sortDirection);
        });
    }, []);
    const handleCreate = () => {
        router.push(privateRoutes.TRANSFERSERVICESCREATE);
    };
    const tableData = vehicles.map((vehicle, index) => ({
        number: (optimisticPage - 1) * perPage + index + 1,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year ? formatDate(vehicle.year) : 'N/A',
        color: vehicle.color,
        plateNumber: vehicle.plateNumber,
        isAvailable: vehicle.isAvailable ? 'Yes' : 'No',
        vehicleInfo: {
            vehicleType: vehicle.vehicleType,
            serviceLevels: vehicle.serviceLevels || 'N/A',
        },
        driverInfo: vehicle.drivers.length > 0
            ? {
                phone: vehicle.drivers[0].phone || 'Не указано',
                fullName: vehicle.drivers[0].fullName || 'Не указано',
            }
            : null,
        createdAt: formatDate(vehicle.createdAt),
        updatedAt: formatDate(vehicle.updatedAt),
        actions: renderActions({
            entity: 'vehicles',
            uuid: vehicle.uuid,
            navigate: router.push,
        }),
    }));
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u0441\u0440\u0435\u0434\u0441\u0442\u0432" }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsx(IButton, { onClick: handleCreate, className: "w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]\n                    text-white font-semibold transition duration-300 ease-in-out\n                    hover:bg-[color:var(--button-secondary-hover)]", textClassName: "text-4 leading-4 text-medium justify-center", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u043E\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043E" }), _jsx(Filters, {})] })] }), _jsx(StatusOverview, { selectedStatus: vehicleTypeFilter, statusCounts: vehicleTypeCounts, onSelectStatus: (status) => setVehicleTypeFilter(status), statusOverview: vehicleTypesOverview }), _jsxs(_Fragment, { children: [view === 'skeleton' && _jsx(SkeletonTable, { columns: vehicleColumns, rows: perPage }), view === 'loading' || isPending ? (_jsx(_Fragment, {})) : view === 'data' ? (_jsx(AnimatedComponent, { duration: 500, className: "w-full", children: _jsx(ITable, { data: tableData, columns: vehicleColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort }) })) : view === 'error' ? (_jsx("div", { className: "text-red-500 mb-4", children: error })) : (_jsx(NoData, {})), total > perPage && (_jsx(Pagination, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChange }))] })] }));
};
export default VehiclesAdminPage;
