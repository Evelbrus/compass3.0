'use client';

import React, { useEffect, useState, JSX, useTransition, useCallback } from 'react';
import { User, UserRole } from '@prisma/client';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { IButton } from '@shared/components/ui/buttons';
import Filters from '@widgets/filters/ui/Filters';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $updateFlag, openModal, View } from '@shared/lib/effector/state/state';
import NoData from '@shared/components/errors/noData';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { ITable, TableUsersRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import { usersColumns } from '@pages/(administrator)/(users)/users/userColums';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { rolesOverview } from '@pages/(administrator)/(users)/users/rolesOverview';
import { useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';

const ClientsAdminPage = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalAllRoles, setTotalAllRoles] = useState<number>(0);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [sortBy, setSortBy] = useState<keyof TableUsersRow>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();
  const [view, setView] = useState<View>('skeleton');
  const [isPending, startTransition] = useTransition();
  const [optimisticPage, setOptimisticPage] = useState(page);

  const updateFlag = useUnit($updateFlag);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (roleFilter !== 'all') {
        url.searchParams.append('role', roleFilter);
      }
      url.searchParams.append('sort_by', sortBy as string);
      url.searchParams.append('sort_order', sortOrder);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Сетевой ответ был неудачным');
      }
      const { status, message, data } = await response.json();

      if (status !== 'success') {
        throw new Error(message);
      }

      setUsers(data.users);
      setTotal(data.total);
      setTotalAllRoles(data.totalAllRoles);

      const roleCountsData: Record<string, number> = { all: data.totalAllRoles };
      data.roleCounts.forEach((item: { role: UserRole; _count: { role: number } }) => {
        roleCountsData[item.role] = item._count.role;
      });

      setRoleCounts(roleCountsData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, updateFlag]);

  useEffect(() => {
    if (error) {
      setView('error');
    } else if (loading && view !== 'skeleton') {
      setView('loading');
    } else if (!loading && users.length > 0) {
      setView('data');
    } else if (!loading && users.length === 0) {
      setView('noData');
    }
  }, [loading, error, users, view]);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setOptimisticPage(page);
      setPage(page);
    });
  }, []);

  const handleSort = useCallback(
    (sortByKey: keyof TableUsersRow, sortDirection: 'asc' | 'desc') => {
      startTransition(() => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
      });
    },
    [],
  );

  const handleCreate = () => {
    openModal('createUserModal');
  };

  const tableData: TableUsersRow[] = users.map((user, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    email: user.email,
    role: user.role,
    additionalInfo: {
      phone: user?.phone || null,
      fullName: user?.fullName || null,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    availability: user.availability ?? false,
    actions: renderActions('users', user.uuid, router.push),
  }));

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">
          Список пользователей (Диспетчерский вид)
        </h1>
        <div className="flex flex-row gap-2">
          <IButton
            onClick={handleCreate}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]
                    text-white font-semibold transition duration-300 ease-in-out
                    hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-4 leading-4 text-medium justify-center"
          >
            Добавить пользователя
          </IButton>
          <Filters />
        </div>
      </div>

      <StatusOverview
        selectedStatus={roleFilter}
        statusCounts={roleCounts}
        onSelectStatus={(status) => setRoleFilter(status as UserRole | 'all')}
        statusOverview={rolesOverview}
      />
      <>
        {view === 'skeleton' && <SkeletonTable columns={usersColumns} rows={perPage} />}
        {view === 'loading' || isPending ? (
          <></>
        ) : view === 'data' ? (
          <AnimatedComponent duration={500} className="w-full">
            <ITable<TableUsersRow>
              data={tableData}
              columns={usersColumns}
              sortBy={sortBy}
              sortDirection={sortOrder}
              onSort={handleSort}
            />
          </AnimatedComponent>
        ) : view === 'error' ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <NoData />
        )}

        {total > perPage && (
          <Pagination
            pageNumber={optimisticPage}
            pageSize={perPage}
            totalCount={total}
            setPageNumber={handlePageChange}
          />
        )}
      </>
    </AnimatedComponent>
  );
};

export default ClientsAdminPage;
