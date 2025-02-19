import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@prisma/client';
import { TableUsersRow } from '@shared/components/ui/table';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { useRouter, useSearchParams } from 'next/navigation';

const useUsers = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  //Устанавливаем состояние напрямую через searchParams
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>(
    (searchParams.get('role') as UserRole) || 'all',
  );
  const [sortBy, setSortBy] = useState<keyof TableUsersRow | null>(
    (searchParams.get('sort_by') as keyof TableUsersRow) || null,
  );

  //ИЗМЕНЕНИЕ ЗДЕСЬ: убрали `| undefined` и задали значение по умолчанию
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    (searchParams.get('sort_order') as 'asc' | 'desc' | undefined) || 'desc',
  );

  const [optimisticPage, setOptimisticPage] = useState(page);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalAllRoles, setTotalAllRoles] = useState<number>(0);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (roleFilter !== 'all') {
        url.searchParams.append('role', roleFilter);
      }
      if (sortBy !== null) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Сетевой ответ был неудачным');
      const { status, message, data } = await response.json();
      if (status !== 'success') throw new Error(message);
      setUsers(data.users);
      setTotal(data.total);
      setTotalAllRoles(data.totalAllRoles);
      const roleCountsData: Record<string, number> = { all: data.totalAllRoles };
      data.roleCounts.forEach((item: { role: UserRole; _count: { role: number } }) => {
        roleCountsData[item.role] = item._count.role;
      });
      setRoleCounts(roleCountsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TableUsersRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection);
  };

  const handleRoleFilterChange = (newRole: UserRole | 'all') => {
    setRoleFilter(newRole);
    setPage(1);
    setOptimisticPage(1);
  };

  const tableData: TableUsersRow[] = users.map((user, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    email: user.email,
    role: user.role,
    fullName: {
      phone: user.phone || null,
      fullName: user.fullName || null,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    availability: user.availability ?? false,
    actions: renderActions({
      entity: 'users',
      uuid: user.uuid,
      navigate: router.push,
    }),
  }));

  return {
    users: tableData,
    loading,
    error,
    total,
    roleCounts,
    optimisticPage,
    perPage,
    roleFilter,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
    handleRoleFilterChange,
  };
};

export default useUsers;
