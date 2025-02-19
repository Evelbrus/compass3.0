'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { rolesOverview } from '@entities/users/rolesOverview';
import useUsers from '@features/users/hooks/useUsers';
import useURLParams from '@shared/utils/hooks/useURLParams';
import UsersTable from '@features/users/table/table/UsersTable';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
const ClientsAdminPage = () => {
    const topRef = useRef(null);
    //Получаем данные из useUsers
    const { users, loading, error, total, roleCounts, optimisticPage, perPage, roleFilter, sortBy, sortOrder, handlePageChange, handleSort, handleRoleFilterChange, } = useUsers();
    //Теперь используем хук useURLParams для обновления URL
    useURLParams({ optimisticPage, roleFilter, sortBy, sortOrder });
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
    return (_jsxs(AnimatedComponent, { className: "relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", duration: 1000, children: [_jsxs("div", { ref: topRef, className: "w-full flex flex-row justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: "\u0421\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 (\u0414\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\u0441\u043A\u0438\u0439 \u0432\u0438\u0434)" }), _jsx("div", { className: "flex flex-row gap-2", children: _jsx(IButton, { onClick: () => openModal('createUserModal'), className: "w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)] text-white font-semibold transition duration-300 ease-in-out hover:bg-[color:var(--button-secondary-hover)]", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }) })] }), _jsx(StatusOverview, { selectedStatus: roleFilter, statusCounts: roleCounts, onSelectStatus: handleRoleFilterChange, statusOverview: rolesOverview }), _jsx(UsersTable, { users: users, loading: loading, error: error, sortBy: sortBy, sortOrder: sortOrder, handleSort: handleSort }), _jsx(PaginationComponent, { pageNumber: optimisticPage, pageSize: perPage, totalCount: total, setPageNumber: handlePageChangeWithScroll })] }));
};
export default ClientsAdminPage;
