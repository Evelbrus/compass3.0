'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import PointsTable from '@features/points/table/PointsTable';
import usePoints from '@features/points/hooks/usePoints';
const Points = () => {
    const topRef = useRef(null);
    //Получаем данные из хука
    const { points, loading, error, total, optimisticPage, perPage, sortBy, sortOrder, handlePageChange, handleSort, } = usePoints();
    //Синхронизируем параметры с URL
    useURLParams({ optimisticPage, sortBy, sortOrder });
    //Обработчик смены страницы с плавным скроллом вверх
    const handlePageChangeWithScroll = (newPage) => {
        handlePageChange(newPage);
        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    };
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { ref: topRef, className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u041F\u0443\u043D\u043A\u0442\u044B \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F" }), _jsx(IButton, { onClick: () => openModal('createPointModal'), children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0447\u043A\u0443" })] }), _jsx(PointsTable, { points: points, loading: loading, error: error, sortBy: sortBy, sortOrder: sortOrder, handleSort: handleSort }), _jsx(PaginationComponent, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChangeWithScroll })] }));
};
export default Points;
