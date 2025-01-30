'use client';

import React, { useEffect, useState, useCallback, useTransition, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { ITable, TableDriversRow } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import Filters from '@widgets/filters/ui/Filters';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag, View } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import { driversColumns } from '@pages/(administrator)/(users)/driver/driverColums';
import { DriverProfile, User } from '@prisma/client';
import { privateRoutes } from '@shared/utils/routing';

const DriversAdminPage = (): JSX.Element => {
  const [users, setUsers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [sortBy, setSortBy] = useState<keyof TableDriversRow>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();
  const [view, setView] = useState<View>('skeleton');
  const [isPending, startTransition] = useTransition();
  const [optimisticPage, setOptimisticPage] = useState(page);

  const updateFlag = useUnit($updateFlag);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      url.searchParams.append('sort_by', sortBy as string);
      url.searchParams.append('sort_order', sortOrder);
      url.searchParams.append('role', 'Driver');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const { status, message, data } = result;

      if (status !== 'success') {
        throw new Error(message || 'Error fetching drivers');
      }

      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Error fetching drivers');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers, updateFlag]);

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
    (sortByKey: keyof TableDriversRow, sortDirection: 'asc' | 'desc') => {
      startTransition(() => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
      });
    },
    [],
  );

  const handleCreate = () => {
    router.push(privateRoutes.USERDRIVERCREATE);
  };

  const tableData: TableDriversRow[] = users.map((user, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    additionalInfo: {
      phone: user.phone,
      fullName: user.fullName,
    },
    passportId: user.driverProfile?.passportId || null,
    passportPhotoPath: user.driverProfile?.passportPhotoPath || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    actions: renderActions('users', user.uuid, router.push),
  }));

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Список водителей (Админ вид)</h1>
        <div className="flex flex-row gap-2">
          <IButton
            onClick={handleCreate}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]
                    text-white font-semibold transition duration-300 ease-in-out
                    hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-4 leading-4 text-medium justify-center"
          >
            Добавить водителя
          </IButton>
          <Filters />
        </div>
      </div>

      <>
        {view === 'skeleton' && <SkeletonTable columns={driversColumns} rows={perPage} />}
        {view === 'loading' || isPending ? (
          <></>
        ) : view === 'data' ? (
          <AnimatedComponent duration={500} className="w-full">
            <ITable<TableDriversRow>
              data={tableData}
              columns={driversColumns}
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

export default DriversAdminPage;
