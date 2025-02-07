import { useState, useCallback, useEffect } from 'react';
import { User } from '@prisma/client';
import { fetchDrivers, fetchAssignedDriver } from '@features/orders/create/api/orderApi';

interface UseDriversProps {
  vehicleType?: string;
  serviceLevel?: string | null;
  search?: string;
  setErrorMessage: (error: Error | null, message: string) => void;
}

export const useDrivers = ({
  vehicleType,
  serviceLevel,
  search,
  setErrorMessage,
}: UseDriversProps) => {
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<User | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(2);
  const [total, setTotal] = useState<number>(0);
  const [isDriversLoading, setIsLoading] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);

  const fetchDriversData = useCallback(
    async (
      vehicleTypeQuery: string | null,
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
        setErrorMessage(error, 'Error fetching drivers');
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
        searchQuery ? undefined : vehicleTypeQuery, //Если есть поисковый запрос, не передаем vehicleType
        searchQuery ? undefined : serviceLevelQuery, //Если есть поисковый запрос, не передаем serviceLevel
        searchQuery,
      );
    },
    [fetchDriversData],
  );

  useEffect(() => {
    fetchDriversData(vehicleType, serviceLevel, '');
  }, [fetchDriversData, vehicleType, serviceLevel]);

  const fetchAssignedDriverData = useCallback(
    async (assignedDriverId: string) => {
      setIsLoading(true);
      try {
        const driverData = await fetchAssignedDriver(assignedDriverId);
        setAssignedDriver(driverData);
      } catch (error) {
        setErrorMessage(error, 'Error fetching assigned driver');
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
