'use client';

import React, { useRef } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { openModal } from '@shared/lib/effector/state/state';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { rolesOverview } from '@entities/users/rolesOverview';
import useUsers from '@features/users/hooks/main/useUsers';
import useURLParams from '@shared/utils/hooks/useURLParams';
import UsersTable from '@features/users/table/table/UsersTable';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import Filters from '@widgets/filters/ui/Filters';

const ClientsAdminPage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);

  //Получаем данные из useUsers
  const {
    users,
    loading,
    error,
    total,
    roleCounts,
    optimisticPage,
    perPage,
    roleFilter,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
    handleRoleFilterChange,
  } = useUsers();

  //Теперь используем хук useURLParams для обновления URL
  useURLParams({ optimisticPage, roleFilter, sortBy, sortOrder });

  //Обработчик изменения страницы
  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);

    //Прокрутка к элементу после изменения страницы
    if (topRef.current) {
      topRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-end items-center px-5">
        <div className="flex flex-row gap-2">
          <IButton
            onClick={() => openModal('createUserModal')}
            className="w-[250px] h-[56px] rounded-lg bg-[color:var(--button-secondary)] text-white font-semibold hover:bg-[color:var(--button-secondary-hover)]"
          >
            Добавить пользователя
          </IButton>
          <Filters />
        </div>
      </div>

      <StatusOverview
        selectedStatus={roleFilter}
        statusCounts={roleCounts}
        onSelectStatus={handleRoleFilterChange}
        statusOverview={rolesOverview}
      />

      <UsersTable
        users={users}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />

      <PaginationComponent
        pageNumber={optimisticPage}
        pageSize={perPage}
        totalCount={total}
        setPageNumber={handlePageChangeWithScroll}
      />
    </AnimatedComponent>
  );
};

export default ClientsAdminPage;
