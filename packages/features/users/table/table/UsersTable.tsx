import React from 'react';
import { ITable, TableUsersRow } from '@shared/components/ui/table';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
import NoData from '@shared/components/errors/noData';
import { usersColumns } from '@features/users/table/table/columns/userColums';

interface UsersTableProps {
  users: TableUsersRow[];
  loading: boolean;
  error: string | null;
  sortBy: keyof TableUsersRow | null;
  sortOrder: 'asc' | 'desc' | undefined;
  handleSort: (sortBy: keyof TableUsersRow | null, sortOrder: 'asc' | 'desc' | undefined) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
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
        <SkeletonTable columns={usersColumns} rows={10} />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <NoData />
      ) : (
        <ITable
          data={users}
          columns={usersColumns}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
};

export default UsersTable;
