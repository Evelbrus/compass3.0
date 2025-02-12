import { useState, useCallback, useEffect } from 'react';
import { User } from '@prisma/client';
import { fetchDrivers, fetchAssignedDriver } from '@features/orders/create/api/orderApi';

interface UseDriversProps {
  vehicleType?: string;
  serviceLevel?: string | null;
  setErrorMessage: (error: Error | null, message: string) => void;
}

export const useDrivers = ({ vehicleType, serviceLevel, setErrorMessage }: UseDriversProps) => {
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<User | null>(null);
  const [page, setPage] = useState<string>('1');
  const [perPage, setPerPage] = useState<string>('2');
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
        setServerTime(driversData.serverTime);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setErrorMessage(normalizedError, 'Error fetching drivers');
        setDrivers(null);
        setTotal(0);
      }
      setIsLoading(false);
    },
    [setErrorMessage, page, perPage],
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

  const fetchAssignedDriverData = useCallback(
    async (assignedDriverId: string) => {
      setIsLoading(true);
      try {
        const driverData = await fetchAssignedDriver(assignedDriverId);
        setAssignedDriver(driverData);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setErrorMessage(normalizedError, 'Error fetching assigned driver');
        setAssignedDriver(null);
      }
      setIsLoading(false);
    },
    [setErrorMessage],
  );

  return {
    drivers,
    assignedDriver,
    isDriversLoading,
    refetchDrivers,
    fetchAssignedDriverData,
    page,
    perPage,
    setPage,
    setPerPage,
    total,
    serverTime,
  };
};
