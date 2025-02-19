'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import useURLParams from '@shared/utils/hooks/useURLParams';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import useAdditionalServices from '@features/additional-service/hooks/useAdditionalServices';
import AdditionalServicesTable from '@features/additional-service/table/AdditionalServicesTable';
const AdditionalServices = () => {
    const topRef = useRef(null);
    //Получаем данные из хука
    const { additionalServices, loading, error, total, optimisticPage, perPage, sortBy, sortOrder, handlePageChange, handleSort, } = useAdditionalServices();
    //Теперь используем хук useURLParams для обновления URL
    useURLParams({ optimisticPage, sortBy, sortOrder });
    //Обработчик изменения страницы с прокруткой вверх
    const handlePageChangeWithScroll = (newPage) => {
        handlePageChange(newPage);
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { ref: topRef, className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), _jsx(IButton, { onClick: () => openModal('createAdditionalServiceModal'), children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u0441\u043B\u0443\u0433\u0443" })] }), _jsx(AdditionalServicesTable, { additionalServices: additionalServices, loading: loading, error: error, sortBy: sortBy, sortOrder: sortOrder, handleSort: handleSort }), _jsx(PaginationComponent, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChangeWithScroll })] }));
};
export default AdditionalServices;
