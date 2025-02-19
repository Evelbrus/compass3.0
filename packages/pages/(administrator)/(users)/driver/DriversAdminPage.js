'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import useDrivers from '@features/users/hooks/useDrivers';
import useURLParams from '@shared/utils/hooks/useURLParams';
import { privateRoutes } from '@shared/utils/routing';
import Filters from '@widgets/filters/ui/Filters';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import DriverTable from '@features/users/table/table/DriverTable';
const DriversAdminPage = () => {
    const topRef = useRef(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { users, loading, error, total, optimisticPage, perPage, sortBy, sortOrder, handlePageChange, handleSort, } = useDrivers();
    //Update URL parameters
    useURLParams({ optimisticPage, sortBy, sortOrder });
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
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { ref: topRef, className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0421\u043F\u0438\u0441\u043E\u043A \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 (\u0410\u0434\u043C\u0438\u043D \u0432\u0438\u0434)" }), _jsx("div", { className: "flex flex-row gap-2", children: _jsx("button", { onClick: () => router.push(privateRoutes.USERDRIVERCREATE), className: "w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F" }) })] }), _jsx(Filters, {}), _jsx(DriverTable, { users: users, loading: loading, error: error, sortBy: sortBy, sortOrder: sortOrder, handleSort: handleSort }), _jsx(PaginationComponent, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChangeWithScroll })] }));
};
export default DriversAdminPage;
