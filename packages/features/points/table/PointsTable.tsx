import React from 'react';
import { ITable, TablePointsRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { pointsColumns } from '@features/points/table/columns/pointsColumns';

interface PointsTableProps {
  points: TablePointsRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TablePointsRow | null;
  sortOrder: 'asc' | 'desc' | undefined;
  handleSort: (sortBy: keyof TablePointsRow | null, sortOrder: 'asc' | 'desc') => void;
}

const PointsTable: React.FC<PointsTableProps> = ({
  points,
  loading,
  error,
  sortBy,
  sortOrder,
  handleSort,
}) => {
  if (loading) return <SkeletonTable columns={pointsColumns} rows={10} />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (points.length === 0) return <NoData />;

  return (
    <ITable
      data={points}
      columns={pointsColumns}
      sortBy={sortBy}
      sortDirection={sortOrder}
      onSort={handleSort}
    />
  );
};

export default PointsTable;
