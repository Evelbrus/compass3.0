import { useState, useCallback, useEffect } from 'react';
import { User } from '@prisma/client';
import { fetchAssignedDriver, fetchDrivers } from '@features/orders/create/api/orders.api';

// Определяем тип для частичного пользователя, который возвращается с API
export type PartialUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;

interface UseDriversProps {
  vehicleType?: string | null;
  serviceLevel?: string | null;
}

export const useDrivers = ({ vehicleType, serviceLevel }: UseDriversProps) => {
  // Изменяем тип состояния, чтобы оно соответствовало возвращаемому типу API
  const [drivers, setDrivers] = useState<PartialUser[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<PartialUser | null>(null);
  const [page, setPage] = useState<string>('1');
  const [perPage] = useState<string>('10');
  const [total, setTotal] = useState<number>(0);
  const [isDriversLoading, setIsLoading] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);

  const fetchDriversData = useCallback(
    async (
      vehicleTypeQuery: string | undefined,
      serviceLevelQuery: string | null | undefined,
      searchQuery: string = '',
    ) => {
      setIsLoading(true);
      try {
        const driversData = await fetchDrivers(
          serviceLevelQuery,
          vehicleTypeQuery,
          searchQuery,
          page,
          perPage,
        );
        // Теперь типы совпадают
        setDrivers(driversData.drivers);
        setTotal(driversData.total);
        setServerTime(driversData.serverTime ? new Date(driversData.serverTime) : null);
      } catch (error) {
        setDrivers(null);
        setTotal(0);
      }
      setIsLoading(false);
    },
    [page, perPage],
  );

  const refetchDrivers = useCallback(
    (searchQuery: string = '', vehicleTypeQuery?: string, serviceLevelQuery?: string | null) => {
      fetchDriversData(
        searchQuery ? undefined : vehicleTypeQuery,
        searchQuery ? null : serviceLevelQuery,
        searchQuery,
      );
    },
    [fetchDriversData],
  );

  useEffect(() => {
    // Преобразуем null в undefined для vehicleType, если необходимо
    const vehicleTypeParam = vehicleType === null ? undefined : vehicleType;
    fetchDriversData(vehicleTypeParam, serviceLevel, '');
  }, [fetchDriversData, vehicleType, serviceLevel]);

  const fetchAssignedDriverData = useCallback(async (assignedDriverId: string) => {
    setIsLoading(true);
    try {
      const driverData = await fetchAssignedDriver(assignedDriverId);
      // Теперь типы совпадают
      setAssignedDriver(driverData);
    } catch (error) {
      setAssignedDriver(null);
    }
    setIsLoading(false);
  }, []);

  return {
    drivers,
    assignedDriver,
    isDriversLoading,
    refetchDrivers,
    fetchAssignedDriverData,
    page,
    perPage,
    setPage,
    total,
    serverTime,
  };
};
