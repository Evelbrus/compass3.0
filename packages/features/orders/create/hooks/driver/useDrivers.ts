import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAssignedDriver, fetchDrivers } from '@features/orders/create/api/orders.api';
import { Driver } from '@features/orders/create/types/types';

interface UseDriversProps {
  vehicleType?: string | null;
  serviceLevel?: string | null;
}

export const useDrivers = ({ vehicleType, serviceLevel }: UseDriversProps) => {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [page, setPage] = useState<string>('1');
  const [perPage] = useState<string>('4');
  const [total, setTotal] = useState<number>(0);
  const [isDriversLoading, setIsLoading] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const initializedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const lastFetchParamsRef = useRef<{
    vehicleType?: string | null | undefined;
    serviceLevel?: string | null | undefined;
    searchQuery?: string;
  }>({});

  const fetchDriversData = useCallback(
    async (
      vehicleTypeQuery: string | undefined,
      serviceLevelQuery: string | null | undefined,
      searchQuery: string = '',
    ) => {
      if (fetchInProgressRef.current) return;
      
      const currentParams = { vehicleType: vehicleTypeQuery, serviceLevel: serviceLevelQuery, searchQuery };
      if (
        initializedRef.current && 
        lastFetchParamsRef.current.vehicleType === vehicleTypeQuery &&
        lastFetchParamsRef.current.serviceLevel === serviceLevelQuery &&
        lastFetchParamsRef.current.searchQuery === searchQuery
      ) {
        return;
      }

      lastFetchParamsRef.current = currentParams;

      fetchInProgressRef.current = true;
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
        initializedRef.current = true;
      } catch (error) {
        setDrivers(null);
        setTotal(0);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          fetchInProgressRef.current = false;
        }, 300);
      }
    },
    [page, perPage],
  );

  const refetchDrivers = useCallback(
    (searchQuery: string = '', vehicleTypeQuery?: string, serviceLevelQuery?: string | null) => {
      if (!vehicleTypeQuery && !serviceLevelQuery && !searchQuery) return;
      
      fetchDriversData(
        searchQuery ? undefined : vehicleTypeQuery,
        searchQuery ? null : serviceLevelQuery,
        searchQuery,
      );
    },
    [fetchDriversData],
  );

  useEffect(() => {
    if (!initializedRef.current && !fetchInProgressRef.current) {
      const vehicleTypeParam = vehicleType === null ? undefined : vehicleType;
      if (vehicleTypeParam || serviceLevel) {
        fetchDriversData(vehicleTypeParam, serviceLevel, '');
      }
      return;
    }

    if (
      initializedRef.current && 
      !fetchInProgressRef.current && 
      (vehicleType || serviceLevel)
    ) {
      const vehicleTypeParam = vehicleType === null ? undefined : vehicleType;
      
      if (
        lastFetchParamsRef.current.vehicleType !== vehicleTypeParam ||
        lastFetchParamsRef.current.serviceLevel !== serviceLevel
      ) {
        fetchDriversData(vehicleTypeParam, serviceLevel, '');
      }
    }
  }, [fetchDriversData, vehicleType, serviceLevel]);

  const fetchAssignedDriverData = useCallback(async (assignedDriverId: string) => {
    if (fetchInProgressRef.current || !assignedDriverId) return;
    
    fetchInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      const driverData = await fetchAssignedDriver(assignedDriverId);
      setAssignedDriver(driverData);
    } catch (error) {
      setAssignedDriver(null);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        fetchInProgressRef.current = false;
      }, 300);
    }
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
