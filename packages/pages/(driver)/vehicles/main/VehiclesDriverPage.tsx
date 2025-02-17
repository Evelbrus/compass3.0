'use client';

import React, { JSX, useEffect, useTransition, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { $updateFlag, View } from '@shared/lib/effector/state/state';
import { ITable, TableVehicleRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import Pagination from '@shared/components/ui/pagination/Pagination';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import NoData from '@shared/components/errors/noData';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import { useVehiclesData } from '@pages/(driver)/vehicles/main/useVehiclesData';
import { vehicleColumns } from '@pages/(driver)/vehicles/main/vehicleColums';
import { mapVehiclesToTableData } from '@pages/(driver)/vehicles/main/tableDataUtils';
import { vehicleTypesOverview } from '@pages/(driver)/vehicles/main/vehicleTypesOverview';
import { VehicleType } from '@prisma/client';

const VehiclesDriverPage = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const updateFlag = useUnit($updateFlag);
  const router = useRouter();
  const [view, setView] = useState<View>('skeleton');
  const [optimisticPage, setOptimisticPage] = useState(1);

  const {
    vehicles,
    loading,
    error,
    page,
    perPage,
    total,
    vehicleTypeFilter,
    vehicleTypeCounts,
    sortBy,
    sortOrder,
    setPage,
    setVehicleTypeFilter,
    setSortBy,
    setSortOrder,
    fetchVehicles,
  } = useVehiclesData();

  const fetchData = useCallback(async () => {
    try {
      await fetchVehicles();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  }, [fetchVehicles]);

  useEffect(() => {
    startTransition(() => {
      fetchData();
    });
  }, [page, vehicleTypeFilter, sortBy, sortOrder, updateFlag, fetchData]);

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

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setOptimisticPage(newPage);
      setPage(newPage);
    });
  };

  const handleSort = useCallback(
    (sortByKey: keyof TableVehicleRow | null, sortDirection: 'asc' | 'desc') => {
      startTransition(() => {
        setSortBy(sortByKey ?? 'createdAt');
        setSortOrder(sortDirection);
      });
    },
    [setSortBy, setSortOrder],
  );

  const handleFilterChange = (status: string) => {
    startTransition(() => {
      setVehicleTypeFilter(status as VehicleType);
      setPage(1);
    });
  };

  const tableData = mapVehiclesToTableData(vehicles, optimisticPage, perPage, router.push);

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <h1 className="text-2xl font-extrabold leading-4">Мои транспортные средства</h1>

      <StatusOverview
        selectedStatus={vehicleTypeFilter}
        statusCounts={vehicleTypeCounts}
        onSelectStatus={handleFilterChange}
        statusOverview={vehicleTypesOverview}
      />

      <>
        {view === 'skeleton' && <SkeletonTable columns={vehicleColumns} rows={perPage} />}

        {view === 'data' ? (
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

export default VehiclesDriverPage;
