'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ITable } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import Filters from '@widgets/filters/ui/Filters';
import { renderOrderDriverActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag, openModal } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { ordersClientCorpColumns } from '@pages/(client-corp)/orders/main/ordersClientCorpColumns';
import { ordersClientCorpOverview } from '@pages/(client-corp)/orders/main/ordersClientCorpOverview';
import useClientCorpOrders from '@pages/(client-corp)/orders/main/hooks/useClientCorpOrders';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
const OrderClientCorpPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [perPage, setPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'PENDING');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
    const [view, setView] = useState('skeleton');
    const [isPending, startTransition] = useTransition();
    const [optimisticPage, setOptimisticPage] = useState(page);
    const updateFlag = useUnit($updateFlag);
    const updateURL = useCallback((newParams) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(newParams)) {
            if (value === null || value === '') {
                newSearchParams.delete(key);
            }
            else {
                newSearchParams.set(key, value.toString());
            }
        }
        router.push(`?${newSearchParams.toString()}`);
    }, [router, searchParams]);
    const { orders, loading, error, total, statusesCount } = useClientCorpOrders({
        page,
        perPage,
        statusFilter,
        sortBy: sortBy,
        sortOrder,
        updateFlag,
        updateURL,
    });
    useEffect(() => {
        if (error) {
            setView('error');
        }
        else if (loading && view !== 'skeleton') {
            setView('loading');
        }
        else if (!loading && orders.length > 0) {
            setView('data');
        }
        else if (!loading && orders.length === 0) {
            setView('noData');
        }
        else if (loading) {
            setView('loading');
        }
    }, [loading, error, orders, view]);
    const handlePageChange = useCallback((page) => {
        startTransition(() => {
            setOptimisticPage(page);
            setPage(page);
            updateURL({ page });
        });
    }, [updateURL]);
    const handleSort = useCallback((sortByKey, sortDirection) => {
        startTransition(() => {
            setSortBy(sortByKey ?? 'createdAt');
            setSortOrder(sortDirection);
            updateURL({ sortBy: sortByKey ?? 'createdAt', sortOrder });
        });
    }, [updateURL]);
    const handleCreate = () => {
        openModal('createClientCorpOrder');
    };
    const tableData = orders.map((order, index) => ({
        number: (optimisticPage - 1) * perPage + index + 1,
        createdBy: {
            fullName: order.createdBy.fullName,
            phone: order.createdBy.phone,
        },
        tariff: {
            name: order.tariff.name,
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
        basePrice: parseFloat(order.basePrice.toString()),
        actions: renderOrderDriverActions({ entity: 'orders', uuid: order.uuid }),
    }));
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0421\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043A\u0430\u0437\u043E\u0432 (\u0410\u0434\u043C\u0438\u043D \u0432\u0438\u0434)" }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsx(IButton, { onClick: handleCreate, className: "w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]\n                    text-white font-semibold transition duration-300 ease-in-out\n                    hover:bg-[color:var(--button-secondary-hover)]", textClassName: "text-4 leading-4 text-medium justify-center", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), _jsx(Filters, {})] })] }), _jsx(StatusOverview, { selectedStatus: statusFilter, statusCounts: statusesCount, onSelectStatus: (status) => setStatusFilter(status), statusOverview: ordersClientCorpOverview }), _jsxs(_Fragment, { children: [view === 'skeleton' && _jsx(SkeletonTable, { columns: ordersClientCorpColumns, rows: perPage }), view === 'loading' || isPending ? (_jsx(_Fragment, {})) : view === 'data' ? (_jsx(AnimatedComponent, { duration: 500, className: "w-full", children: _jsx(ITable, { data: tableData, columns: ordersClientCorpColumns, sortBy: sortBy, sortDirection: sortOrder, onSort: handleSort }) })) : view === 'error' ? (_jsx("div", { className: "text-red-500 mb-4", children: error })) : (_jsx(NoData, {})), total > perPage && (_jsx(Pagination, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChange }))] })] }));
};
export default OrderClientCorpPage;
