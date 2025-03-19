import { useState, useEffect, useCallback } from 'react';
import { DriverProfile, User } from '@prisma/client';
import { TableDriversRow } from '@shared/components/ui/table';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkAndHandleRedirect } from '@shared/api'; // Добавляем импорт

const useDrivers = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [users, setUsers] = useState<
    (User & {
      driverProfile: DriverProfile & {
        driverExperience?: { companyName: string }[] | null;
        driverHistory?: { totalOrders: number; totalFines: number }[] | null;
      };
    })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [optimisticPage, setOptimisticPage] = useState<number>(1);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);
  const [total, setTotal] = useState<number>(0);
  const [sortBy, setSortBy] = useState<keyof TableDriversRow | null>(
    (searchParams.get('sort_by') as keyof TableDriversRow) || null,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    (searchParams.get('sort_order') as 'asc' | 'desc' | undefined) || 'desc',
  );

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (sortBy !== null) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }
      url.searchParams.append('role', 'Driver');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      // Добавляем проверку на редирект
      if (checkAndHandleRedirect(data)) {
        return; // Прерываем выполнение если произошел редирект
      }

      const { status, message, data: responseData } = data;

      if (status !== 'success') throw new Error(message || 'Error fetching drivers');

      setUsers(responseData.users);
      setTotal(responseData.total);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Error fetching drivers');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TableDriversRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection);
  };

  const tableData: TableDriversRow[] = users.map((user, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    fullName: {
      phone: user.phone,
      fullName: user.fullName,
    },
    passportId: user.driverProfile?.passportId ? user.driverProfile.passportId.toString() : null,
    passportPhotoPath: user.driverProfile?.passportPhotoPath || null,
    yearsOfDriving: user.driverProfile?.yearsOfDriving || null,
    companyName: user.driverProfile?.driverExperience?.[0]?.companyName || null,
    totalOrders: user.driverProfile?.driverHistory?.[0]?.totalOrders || null,
    totalFines: user.driverProfile?.driverHistory?.[0]?.totalFines || null,
    partnerCompany: user.partnerCompany || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
  };
};

export default useDrivers;
