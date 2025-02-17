import React from 'react';
import { ITable, TableAdditionalServicesRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { additionalServicesColumns } from '@features/additional-service/table/columns/additionalServicesColumns';

interface AdditionalServicesTableProps {
  additionalServices: TableAdditionalServicesRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TableAdditionalServicesRow | null;
  sortOrder: 'asc' | 'desc' | undefined;
  handleSort: (sortBy: keyof TableAdditionalServicesRow | null, sortOrder: 'asc' | 'desc') => void;
}

const AdditionalServicesTable: React.FC<AdditionalServicesTableProps> = ({
  additionalServices,
  loading,
  error,
  sortBy,
  sortOrder,
  handleSort,
}) => {
  return (
    <div>
      {loading ? (
        <SkeletonTable columns={additionalServicesColumns} rows={10} />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : additionalServices.length === 0 ? (
        <NoData />
      ) : (
        <ITable
          data={additionalServices}
          columns={additionalServicesColumns}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
};

export default AdditionalServicesTable;
