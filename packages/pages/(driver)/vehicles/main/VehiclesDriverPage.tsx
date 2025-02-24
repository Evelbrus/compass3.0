'use client';

import React, { useRef } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import StatusOverview from '@widgets/status-overview/ui/StatusOverview';
import PaginationComponent from '@shared/components/ui/pagination/PaginationComponent';
import useVehicles from '@features/vehicles/hooks/useVehicles';
import useURLParams from '@shared/utils/hooks/useURLParams';
import VehiclesDriverTable from '@features/vehicles/table/VehiclesDriverTable';
import { vehicleTypesOverview } from '@entities/vehicles/vehiclesOverview';

const VehiclesDriverPage: React.FC = () => {
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
  } = useVehicles();

  useURLParams({ optimisticPage, vehicleTypeFilter, sortBy, sortOrder });

  const handlePageChangeWithScroll = (newPage: number) => {
    handlePageChange(newPage);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatedComponent
      className="relative max-w-full min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4"
      duration={1000}
    >
      <div ref={topRef} className="w-full flex flex-row justify-between items-center">
        <h1 className="text-2xl font-extrabold leading-4">Мои транспортные средства</h1>
      </div>

      <StatusOverview
        selectedStatus={vehicleTypeFilter}
        statusCounts={vehicleTypeCounts}
        onSelectStatus={handleVehicleTypeFilterChange}
        statusOverview={vehicleTypesOverview}
      />

      <VehiclesDriverTable
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
