'use client';

import React, { useRef } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import useDriverVehicles from '@features/vehicles/hooks/useDriverVehicles';
import useURLParams from '@shared/utils/hooks/useURLParams';
import VehiclesTable from '@features/vehicles/table/VehiclesTable';
import { vehicleTypesOverview } from '@entities/vehicles/vehiclesOverview';
import { IButton } from '@shared/components/ui/buttons';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';


const VehiclesDriverPage: React.FC = () => {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const {
    vehicles,
    loading,
    error,
    total,
    vehicleTypeCounts,
    optimisticPage,
    perPage,
    vehicleTypeFilter,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
    handleVehicleTypeFilterChange,
  } = useDriverVehicles();

  useURLParams({ optimisticPage, vehicleTypeFilter, sortBy, sortOrder });

  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCreate = () => {
    router.push(privateRoutes.TRANSFERSERVICESCREATE);
  };


  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Мои транспортные средства</h1>
        <IButton
          onClick={handleCreate}
          className="w-[250px] h-[56px] rounded-lg bg-[color:var(--button-secondary)] text-white font-semibold hover:bg-[color:var(--button-secondary-hover)]"
        >
          Создать автомобиль
        </IButton>
      </div>

      <StatusOverview
        selectedStatus={vehicleTypeFilter}
        statusCounts={vehicleTypeCounts}
        onSelectStatus={handleVehicleTypeFilterChange}
        statusOverview={vehicleTypesOverview}
      />

      <VehiclesTable
        vehicles={vehicles}
        loading={loading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />

      {total > perPage && (
        <PaginationComponent
          pageNumber={optimisticPage}
          pageSize={perPage}
          totalCount={total}
          setPageNumber={handlePageChangeWithScroll}
        />
      )}
    </AnimatedComponent>
  );
};

export default VehiclesDriverPage;