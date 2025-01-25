'use client';

import React, { useEffect, useState, useCallback, useTransition, JSX } from 'react';
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
import { vehicleColumns } from '@pages/(administrator)/vehicles/vehicleColums';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { VehicleType } from '@prisma/client';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';
import { vehicleTypesOverview } from '@pages/(administrator)/vehicles/vehiclesOverview';
import { VehicleOverview } from '@shared/prisma/interface/vehicles/interface';

const VehiclesAdminPage = (): JSX.Element => {
  const [vehicles, setVehicles] = useState<VehicleOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalAllVehicles, setTotalAllVehicles] = useState<number>(0);
  const [vehicleTypeCounts, setVehicleTypeCounts] = useState<Record<string, number>>({});
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | 'all' | null>('all');
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
      if (vehicleTypeFilter && vehicleTypeFilter !== 'all') {
        url.searchParams.append('vehicleType', vehicleTypeFilter);
      }
      url.searchParams.append('sort_by', sortBy as string);
      url.searchParams.append('sort_order', sortOrder);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Сетевой ответ был неудачным');
      }
      const data = await response.json();
      setVehicles(data.data.vehicles || []);
      setTotal(data.data.total);
      setTotalAllVehicles(data.data.totalAllVehicles);

      const vehicleTypeCountsData: Record<string, number> = { all: data.data.totalAllVehicles };

      data.data.vehicleTypeCounts?.forEach((item: { type: VehicleType; count: number }) => {
        vehicleTypeCountsData[item.type] = item.count;
      });

      setVehicleTypeCounts(vehicleTypeCountsData);
    } catch (error) {
      console.error('Ошибка при получении транспортных средств:', error);
      setError('Ошибка при получении транспортных средств');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, vehicleTypeFilter, sortBy, sortOrder]);

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
    vehicleInfo: {
      vehicleType: vehicle.vehicleType,
      serviceLevels: vehicle.serviceLevels || 'N/A',
    },
    driverInfo:
      vehicle.drivers.length > 0
        ? {
            phone: vehicle.drivers[0].phone || 'Не указано',
            fullName: vehicle.drivers[0].fullName || 'Не указано',
          }
        : null,
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

      <StatusOverview
        selectedStatus={vehicleTypeFilter}
        statusCounts={vehicleTypeCounts}
        onSelectStatus={(status) => setVehicleTypeFilter(status as VehicleType)}
        statusOverview={vehicleTypesOverview}
      />

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
