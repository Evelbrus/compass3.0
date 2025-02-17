import React from 'react';
import { ITable, TableDriversRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { driversColumns } from '@features/users/table/table/columns/driverColums';

interface DriverTableProps {
  users: TableDriversRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TableDriversRow | null;
  sortOrder: 'asc' | 'desc' | undefined;
  handleSort: (sortBy: keyof TableDriversRow | null, sortOrder: 'asc' | 'desc' | undefined) => void;
}

const DriverTable: React.FC<DriverTableProps> = ({
  users,
  loading,
  error,
  sortBy,
  sortOrder,
  handleSort,
}) => {
  return (
    <div>
      {loading ? (
        <SkeletonTable columns={driversColumns} rows={10} />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <NoData />
      ) : (
        <ITable<TableDriversRow>
          data={users}
          columns={driversColumns}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
};

export default DriverTable;
