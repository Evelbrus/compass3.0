import { useState, useEffect, useCallback } from 'react';
import { useDrivers } from '@features/orders/create/hooks';
import useDebounce from '@shared/utils/hooks/useDebounce';

interface UseOrderCreateDriversProps {
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
  selectedVehicleType: string;
  selectedServiceLevel: string;
}

export const useOrderCreateDrivers = ({
  setErrorMessage,
  selectedVehicleType,
  selectedServiceLevel,
}: UseOrderCreateDriversProps) => {
  const [searchDriver, setSearchDriver] = useState('');
  const debouncedSearchDriver = useDebounce(searchDriver, 300);

  const [selectedDriverInfo, setSelectedDriverInfo] = useState<{
    uuid: string;
    fullName: string;
  } | null>(null);

  const {
    drivers,
    total,
    page,
    perPage,
    changePage,
    changePerPage,
    isDriversLoading,
    fetchAllDrivers,
  } = useDrivers({
    selectedServiceLevel,
    selectedVehicleType,
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
      setSelectedDriverInfo((prev) => {
        if (prev?.uuid === driverId) return null;
        return selectedDriver
          ? { uuid: selectedDriver.uuid, fullName: selectedDriver.fullName }
          : null;
      });
      handleDriverClick(driverId);
    },
    [drivers, handleDriverClick],
  );

  useEffect(() => {
    if (selectedVehicleType && selectedServiceLevel) {
      fetchAllDrivers();
    }
  }, [fetchAllDrivers, selectedServiceLevel, selectedVehicleType]);

  return {
    drivers,
    total,
    page,
    perPage,
    changePage,
    changePerPage,
    isDriversLoading,
    handleSearchDriver,
    searchDriver,
    setSearchDriver,
    setPage,
    handleDriverClick: handleDriverClickWithInfo,
    selectedDriverInfo,
    setSelectedDriverInfo,
  };
};
