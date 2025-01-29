import { useState, useEffect, useCallback } from 'react';
import { User } from '@prisma/client';
import { useDrivers } from '@features/orders/create/hooks';
import useDebounce from '@shared/utils/hooks/useDebounce';

interface UseDriversProps {
  setErrorMessage: (error: any, message: string) => void;
  setSelectedDriverInfo: (driverInfo: { uuid: string; fullName: string } | null) => void;
}

interface UseDriversResult {
  drivers: User[] | null;
  page: number;
  perPage: number;
  total: number;
  changePage: (newPage: number) => void;
  changePerPage: (newPerPage: number) => void;
  isLoading: boolean;
  handleSearchDriver: (value: string) => void;
  searchDriver: string;
  setSearchDriver: (value: string) => void;
  setPage: (newPage: number) => void;
  handleDriverClick: (driverId: string) => void;
}

export const useOrderCreateDrivers = ({
  setErrorMessage,
  setSelectedDriverInfo,
}: UseDriversProps): UseDriversResult => {
  const [searchDriver, setSearchDriver] = useState('');
  const debouncedSearchDriver = useDebounce(searchDriver, 300);

  const { drivers, total, page, perPage, changePage, changePerPage, isLoading, fetchAllDrivers } =
    useDrivers({
      selectedServiceLevel: '',
      selectedVehicleType: '',
      searchDriver: debouncedSearchDriver,
      setErrorMessage,
    });

  const handleSearchDriver = (value: string) => {
    setSearchDriver(value);
  };

  const handleDriverClick = useCallback((driverId: string) => {
    console.log('handleDriverClick', driverId);
  }, []);

  const setPage = useCallback(
    (newPage: number) => {
      if (newPage > 0) {
        changePage(newPage);
      }
    },
    [changePage],
  );

  const handleDriverClickWithInfo = useCallback(
    (driverId: string) => {
      const selectedDriver = drivers?.find((driver) => driver.uuid === driverId);
      if (selectedDriver) {
        setSelectedDriverInfo({ uuid: selectedDriver.uuid, fullName: selectedDriver.fullName });
      } else {
        setSelectedDriverInfo(null);
      }
      handleDriverClick(driverId);
    },
    [drivers, handleDriverClick, setSelectedDriverInfo],
  );

  useEffect(() => {
    fetchAllDrivers();
  }, [fetchAllDrivers]);

  return {
    drivers,
    total,
    page,
    perPage,
    changePage,
    changePerPage,
    isLoading,
    handleSearchDriver,
    searchDriver,
    setSearchDriver,
    setPage,
    handleDriverClick: handleDriverClickWithInfo,
  };
};
