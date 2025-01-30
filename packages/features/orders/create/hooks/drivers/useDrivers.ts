import { useState, useEffect, useCallback } from 'react';
import { fetchDrivers } from '@features/orders/create/api/orderApi';
import { User } from '@prisma/client';

interface UseDriversProps {
  selectedServiceLevel?: string;
  selectedVehicleType?: string;
  searchDriver?: string;
  initialPage?: number;
  initialPerPage?: number;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export interface UseDriversResult {
  drivers: User[] | null;
  page: number;
  perPage: number;
  total: number;
  changePage: (newPage: number) => void;
  changePerPage: (newPerPage: number) => void;
  isDriversLoading: boolean;
  fetchAllDrivers: () => void;
}

export const useDrivers = ({
  selectedServiceLevel,
  selectedVehicleType,
  searchDriver,
  setErrorMessage,
  initialPage = 1,
  initialPerPage = 5,
}: UseDriversProps): UseDriversResult => {
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);
  const [isDriversLoading, setIsLoading] = useState(false);

  const fetchAllDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const driversData = await fetchDrivers(
        selectedServiceLevel,
        selectedVehicleType,
        searchDriver,
        page,
        perPage,
      );
      if (driversData) {
        setDrivers(driversData.drivers);
        setTotal(driversData.total);
      } else {
        setDrivers(null);
        setTotal(0);
      }
    } catch (error) {
      setErrorMessage(error, 'Error fetching drivers');
      setDrivers(null);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedServiceLevel, selectedVehicleType, searchDriver, setErrorMessage, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [searchDriver]);

  useEffect(() => {
    fetchAllDrivers();
  }, [fetchAllDrivers]);

  const changePage = (newPage: number) => {
    if (newPage > 0) {
      setPage(newPage);
    }
  };

  const changePerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
  };

  return {
    drivers,
    total,
    fetchAllDrivers,
    page,
    perPage,
    changePage,
    changePerPage,
    isDriversLoading,
  };
};
