'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Filters from '@widgets/filters/ui/Filters';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import useOrders from '@features/orders/hooks/useOrders';
import useURLParams from '@shared/utils/hooks/useURLParams';
import { privateRoutes } from '@shared/utils/routing';
import { ordersOverview } from '@entities/orders/ordersOverview';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import OrderTable from '@features/orders/table/table/OrderTable';
const OrderAdminPage = () => {
    const topRef = useRef(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { orders, loading, error, total, optimisticPage, perPage, sortBy, sortOrder, statusesCount, statusFilter, handleStatusFilterChange, handlePageChange, handleSort, } = useOrders();
    //Синхронизируем параметры с URL
    useURLParams({ optimisticPage, statusFilter, sortBy, sortOrder });
    //Обработчик изменения страницы
    const handlePageChangeWithScroll = (newPage) => {
        handlePageChange(newPage);
        //Прокрутка к элементу после изменения страницы
        if (topRef.current) {
            topRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { ref: topRef, className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0421\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043A\u0430\u0437\u043E\u0432 (\u0410\u0434\u043C\u0438\u043D \u0432\u0438\u0434)" }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsx(IButton, { onClick: () => router.push(privateRoutes.ORDERCREATE), className: "w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), _jsx(Filters, {})] })] }), _jsx(StatusOverview, { selectedStatus: statusFilter, statusCounts: statusesCount, onSelectStatus: handleStatusFilterChange, statusOverview: ordersOverview }), _jsx(OrderTable, { orders: orders, loading: loading, error: error, sortBy: sortBy, sortOrder: sortOrder, handleSort: handleSort }), _jsx(PaginationComponent, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChangeWithScroll })] }));
};
export default OrderAdminPage;
