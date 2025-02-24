import { useState, useCallback, useEffect } from 'react';
import { User } from '@prisma/client';
import { fetchAssignedDriver, fetchDrivers } from '@features/orders/create/api/orders.api';

interface UseDriversProps {
  vehicleType?: string;
  serviceLevel?: string | null;
}

export const useDrivers = ({ vehicleType, serviceLevel }: UseDriversProps) => {
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<User | null>(null);
  const [page, setPage] = useState<string>('1');
  const [perPage] = useState<string>('10'); // Можно настроить через пропсы
  const [total, setTotal] = useState<number>(0);
  const [isDriversLoading, setIsLoading] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);

  const fetchDriversData = useCallback(
    async (
      vehicleTypeQuery: string | undefined,
      serviceLevelQuery: string | null,
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
        setDrivers(driversData.drivers);
        setTotal(driversData.total);
        // Преобразуем serverTime в объект Date, если оно существует
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
        searchQuery ? null : (serviceLevelQuery ?? null),
        searchQuery,
      );
    },
    [fetchDriversData],
  );

  useEffect(() => {
    fetchDriversData(vehicleType, serviceLevel ?? null, '');
  }, [fetchDriversData, vehicleType, serviceLevel]);

  const fetchAssignedDriverData = useCallback(async (assignedDriverId: string) => {
    setIsLoading(true);
    try {
      const driverData = await fetchAssignedDriver(assignedDriverId);
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
