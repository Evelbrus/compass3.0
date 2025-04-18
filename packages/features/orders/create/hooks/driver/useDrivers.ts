import { useState, useCallback, useEffect } from 'react';
import { fetchAssignedDriver, fetchDrivers } from '@features/orders/create/api/orders.api';
import { Driver } from '@features/orders/create/types/types';

interface UseDriversProps {
  vehicleType?: string | null;
  serviceLevel?: string | null;
}

export const useDrivers = ({ vehicleType, serviceLevel }: UseDriversProps) => {
  console.log('useDrivers called', { vehicleType, serviceLevel });
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [page, setPage] = useState<string>('1');
  const [perPage] = useState<string>('4');
  const [total, setTotal] = useState<number>(0);
  const [isDriversLoading, setIsLoading] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);

  const fetchDriversData = useCallback(
    async (
      vehicleTypeQuery: string | undefined,
      serviceLevelQuery: string | null | undefined,
      searchQuery: string = '',
    ) => {
      console.log('fetchDriversData', { vehicleTypeQuery, serviceLevelQuery, searchQuery, page, perPage });
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
    const vehicleTypeParam = vehicleType === null ? undefined : vehicleType;
    fetchDriversData(vehicleTypeParam, serviceLevel, '');
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
