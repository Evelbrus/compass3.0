'use client';

import React, { useEffect, useState, useCallback, useTransition, JSX } from 'react';
import { DetailVehicleData } from '@shared/prisma/interface/vehicles/interface';
import Filters from '@widgets/filters/ui/Filters';
import { ITable, TableVehicleRow } from '@shared/components/ui/table';
import Pagination from '@shared/components/ui/pagination/Pagination';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { $updateFlag, View } from '@shared/lib/effector/state/state';
import { useUnit } from 'effector-react';
import { vehicleColumns } from '@pages/(client)/vehicles/vehicleColums';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';

//Функция для форматирования даты в строку формата YYYY-MM-DD
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${month}-${day}`;
};

const VehiclesAdminPage = (): JSX.Element => {
  const [vehicles, setVehicles] = useState<DetailVehicleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalAllVehicles, setTotalAllVehicles] = useState<number>(0);
  const [sortBy, setSortBy] = useState<keyof TableVehicleRow>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<View>('skeleton');
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
      url.searchParams.append('sort_by', sortBy as string);
      url.searchParams.append('sort_order', sortOrder);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Сетевой ответ был неудачным');
      }
      const data = await response.json();
      setVehicles(data.vehicles || []);
      setTotal(data.total);
      setTotalAllVehicles(data.totalAllVehicles);
    } catch (error) {
      console.error('Ошибка при получении транспортных средств:', error);
      setError('Ошибка при получении транспортных средств');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles, updateFlag]);

  useEffect(() => {
    if (error) {
      setView('error');
    } else if (loading && view !== 'skeleton') {
      setView('loading');
    } else if (!loading && vehicles.length > 0) {
      setView('data');
    } else if (!loading && vehicles.length === 0) {
      setView('noData');
    }
  }, [loading, error, vehicles, view]);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setOptimisticPage(page);
      setPage(page);
    });
  }, []);

  const handleSort = useCallback(
    (sortByKey: keyof TableVehicleRow, sortDirection: 'asc' | 'desc') => {
      //Изменено на keyof TableVehicleRow
      startTransition(() => {
        setSortBy(sortByKey);
        setSortOrder(sortDirection);
      });
    },
    [],
  );

  const handleCreate = () => {
    router.push(privateRoutes.TRANSFERSERVICESCREATE);
  };

  const tableData: TableVehicleRow[] = vehicles.map((vehicle, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year ? formatDate(vehicle.year) : 'N/A',
    color: vehicle.color,
    plateNumber: vehicle.plateNumber,
    isAvailable: vehicle.isAvailable ? 'Yes' : 'No',
    createdAt: formatDate(vehicle.createdAt),
    updatedAt: formatDate(vehicle.updatedAt),
    actions: renderActions('vehicles', vehicle.uuid, router.push),
  }));

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">
          Административная страница транспортных средств
        </h1>
        <div className="flex flex-row gap-2">
          <IButton
            onClick={handleCreate}
            className="w-[250px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]
                    text-white font-semibold transition duration-300 ease-in-out
                    hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-4 leading-4 text-medium justify-center"
          >
            Добавить транспортное средство
          </IButton>
          <Filters />
        </div>
      </div>

      <>
        {view === 'skeleton' && <SkeletonTable columns={vehicleColumns} rows={perPage} />}
        {view === 'loading' || isPending ? (
          <></>
        ) : view === 'data' ? (
          <AnimatedComponent duration={500} className="w-full">
            <ITable<TableVehicleRow>
              data={tableData}
              columns={vehicleColumns}
              sortBy={sortBy}
              sortDirection={sortOrder}
              onSort={handleSort}
              enableStatusFilter={false}
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

export default VehiclesAdminPage;
