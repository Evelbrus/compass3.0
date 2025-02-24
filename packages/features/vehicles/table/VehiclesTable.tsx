import React from 'react';
import { ITable, TableVehicleRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { vehicleColumns } from '@features/vehicles/table/columns/vehicleColums';

interface VehiclesTableProps {
  vehicles: TableVehicleRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TableVehicleRow | null;
  sortOrder: 'asc' | 'desc';
  handleSort: (sortBy: keyof TableVehicleRow | null, sortOrder: 'asc' | 'desc' | undefined) => void;
}

const VehiclesTable: React.FC<VehiclesTableProps> = ({
  vehicles,
  loading,
  error,
  sortBy,
  sortOrder,
  handleSort,
}) => {
  return (
    <div>
      {loading ? (
        <SkeletonTable columns={vehicleColumns} rows={10} />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : vehicles.length === 0 ? (
        <NoData />
      ) : (
        <ITable
          data={vehicles}
          columns={vehicleColumns}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
};

export default VehiclesTable;
