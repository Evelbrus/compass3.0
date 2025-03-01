import { useState, useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ServiceLevels, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { useDrivers } from '@features/orders/create/hooks/driver/useDrivers';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { Driver } from '@features/orders/create/types/types';

interface UseOrderCreateDriversProps {
  setValue: UseFormSetValue<FormOrderValues>;
  assignedDriverId?: string | null;
  selectedVehicleType: string | null;
  selectedServiceLevel: string | null;
  setSelectedVehicleType: (type: VehicleType) => void;
  setSelectedServiceLevel: (level: ServiceLevels) => void;
}

interface DriverHistoryItem {
  vehicleType: VehicleType;
  serviceLevel: ServiceLevels;
  driver: Driver;
}

export const useOrderCreateDrivers = ({
  setValue,
  assignedDriverId,
  selectedVehicleType,
  selectedServiceLevel,
  setSelectedVehicleType,
  setSelectedServiceLevel,
}: UseOrderCreateDriversProps) => {
  const [searchDriver, setSearchDriver] = useState('');
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<Driver | null>(null);
  const debouncedSearchDriver = useDebounce(searchDriver, 500);
  const selectOpenRef = useRef(false);
  const isInitialMount = useRef(true);
  const cancelledToastShownRef = useRef(false);
  const [currentTotal, setCurrentTotal] = useState(0);
  const lastVehicleTypeRef = useRef<VehicleType | undefined>(undefined);
  const lastServiceLevelRef = useRef<ServiceLevels | undefined>(undefined);

  const driverHistoryRef = useRef<DriverHistoryItem[]>([]);

  const {
    drivers: rawDrivers,
    assignedDriver,
    isDriversLoading,
    refetchDrivers,
    fetchAssignedDriverData,
    page,
    perPage,
    setPage,
    total,
    serverTime,
  } = useDrivers({
    vehicleType: selectedVehicleType,
    serviceLevel: selectedServiceLevel,
  });

  const drivers = rawDrivers as Driver[] | undefined;

  useEffect(() => {
    setCurrentTotal(total);
  }, [total]);

  useEffect(() => {
    if (assignedDriverId) {
      fetchAssignedDriverData(assignedDriverId);
    }
  }, [assignedDriverId, fetchAssignedDriverData]);

  const getAvailableServiceLevelsForVehicleType = useCallback(
    (vehicleType: VehicleType | undefined) => {
      if (!vehicleType) return [];
      const availableServiceLevels = drivers
          ?.filter((driver) => driver.vehicleDriver?.vehicle?.vehicleType === vehicleType)
          .map((driver) => driver.vehicleDriver?.vehicle?.serviceLevels as ServiceLevels)
        .filter(Boolean);
      return [...new Set(availableServiceLevels)];
    },
    [drivers],
  );

  const validateDriverCompatibility = useCallback(
    (driver: Driver): boolean => {
      if (!driver.vehicleDriver?.vehicle) return false;
      const { vehicle } = driver.vehicleDriver;

      if (!selectedVehicleType || !selectedServiceLevel) {
        return true;
      }

      return (
        vehicle.vehicleType === selectedVehicleType &&
        vehicle.serviceLevels === selectedServiceLevel
      );
    },
    [selectedVehicleType, selectedServiceLevel],
  );

  const saveDriverToHistory = useCallback((driver: Driver) => {
    if (!driver.vehicleDriver?.vehicle) return;
    const vehicleType = driver.vehicleDriver.vehicle.vehicleType as VehicleType;
    const serviceLevel = driver.vehicleDriver.vehicle.serviceLevels as ServiceLevels;
    const existingIndex = driverHistoryRef.current.findIndex(
      (item) => item.vehicleType === vehicleType && item.serviceLevel === serviceLevel,
    );
    if (existingIndex !== -1) {
      driverHistoryRef.current[existingIndex] = { vehicleType, serviceLevel, driver };
    } else {
      driverHistoryRef.current.push({ vehicleType, serviceLevel, driver });
    }
  }, []);

  const findDriverInHistory = useCallback(() => {
    if (!selectedVehicleType || !selectedServiceLevel) return null;
    return (
      driverHistoryRef.current.find(
        (item) =>
          item.vehicleType === selectedVehicleType && item.serviceLevel === selectedServiceLevel,
      )?.driver || null
    );
  }, [selectedVehicleType, selectedServiceLevel]);

  useEffect(() => {
    if (
      selectedVehicleType !== lastVehicleTypeRef.current ||
      selectedServiceLevel !== lastServiceLevelRef.current
    ) {
      lastVehicleTypeRef.current = selectedVehicleType as VehicleType;
      lastServiceLevelRef.current = selectedServiceLevel as ServiceLevels;

      if (selectedDriverInfo && !validateDriverCompatibility(selectedDriverInfo)) {
        if (!cancelledToastShownRef.current) {
          showToast.info('Водитель отменён из-за изменения параметров');
          cancelledToastShownRef.current = true;
        }
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', ''); // Исправлено: передаем строку

        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', historyDriver.uuid); // Исправлено
          showToast.success('Водитель восстановлен из истории');
          cancelledToastShownRef.current = false;
        }
      } else if (!selectedDriverInfo) {
        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', historyDriver.uuid); // Исправлено
          showToast.success('Водитель восстановлен из истории');
          cancelledToastShownRef.current = false;
        }
      }

      if (selectedVehicleType) {
        const vehicleTypeValue = selectedVehicleType as VehicleType;
        const serviceLevelValue = selectedServiceLevel as ServiceLevels | undefined;
        refetchDrivers('', vehicleTypeValue, serviceLevelValue);
      }
    }
  }, [
    selectedVehicleType,
    selectedServiceLevel,
    selectedDriverInfo,
    validateDriverCompatibility,
    setValue,
    findDriverInHistory,
    refetchDrivers,
  ]);

  useEffect(() => {
    if (selectedVehicleType && drivers && drivers.length > 0) {
      const availableServiceLevels = getAvailableServiceLevelsForVehicleType(
        selectedVehicleType as VehicleType,
      );
      if (
        availableServiceLevels.length > 0 &&
        (!selectedServiceLevel ||
          !availableServiceLevels.includes(selectedServiceLevel as ServiceLevels))
      ) {
        const firstServiceLevel = availableServiceLevels[0];
        if (firstServiceLevel) {
          setSelectedServiceLevel(firstServiceLevel);
          setValue('serviceLevel', firstServiceLevel);
        }
      }
    }
  }, [
    selectedVehicleType,
    drivers,
    selectedServiceLevel,
    setValue,
    setSelectedServiceLevel,
    getAvailableServiceLevelsForVehicleType,
  ]);

  useEffect(() => {
    if (assignedDriverId && assignedDriver) {
      const driver = assignedDriver as Driver;
      const isCompatible = validateDriverCompatibility(driver);

      if (isCompatible) {
        setSelectedDriverInfo(driver);
        setValue('assignedDriverId', driver.uuid); // Исправлено

        if (driver.vehicleDriver?.vehicle) {
          const vehicleType = driver.vehicleDriver.vehicle.vehicleType as VehicleType;
          const serviceLevel = driver.vehicleDriver.vehicle.serviceLevels as ServiceLevels;

          setSelectedVehicleType(vehicleType);
          setValue('vehicleType', vehicleType);
          setSelectedServiceLevel(serviceLevel);
          setValue('serviceLevel', serviceLevel);

          saveDriverToHistory(driver);
        }
      } else {
        if (!cancelledToastShownRef.current) {
          showToast.info('Водитель отменён из-за несовместимости с выбранными параметрами');
          cancelledToastShownRef.current = true;
        }
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', ''); // Исправлено
      }
    }
  }, [
    assignedDriverId,
    assignedDriver,
    setValue,
    validateDriverCompatibility,
    saveDriverToHistory,
    setSelectedVehicleType,
    setSelectedServiceLevel,
  ]);

  useEffect(() => {
    if (isInitialMount.current && !searchDriver) {
      isInitialMount.current = false;
      return;
    }

    const vehicleTypeValue = selectedVehicleType as VehicleType | undefined;
    const serviceLevelValue = selectedServiceLevel as ServiceLevels | undefined;
    refetchDrivers(debouncedSearchDriver, vehicleTypeValue, serviceLevelValue);
  }, [
    debouncedSearchDriver,
    page,
    perPage,
    refetchDrivers,
    selectedVehicleType,
    selectedServiceLevel,
  ]);

  const handleSearchDriverChange = useCallback(
    (value: string) => {
      setSearchDriver(value);
      setPage('1');
    },
    [setPage],
  );

  const handleSelectOpenChange = useCallback((isOpen: boolean) => {
    selectOpenRef.current = isOpen;
    setSearchDriver('');
  }, []);

  const handleDriverSelect = useCallback(
    (driver: Driver) => {
      if (!driver.vehicleDriver?.vehicle) {
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', ''); // Исправлено
        return;
      }

      const { vehicle } = driver.vehicleDriver;
      const vehicleType = vehicle.vehicleType as VehicleType;
      const serviceLevel = vehicle.serviceLevels as ServiceLevels;

      setSelectedVehicleType(vehicleType);
      setValue('vehicleType', vehicleType);
      setSelectedServiceLevel(serviceLevel);
      setValue('serviceLevel', serviceLevel);

      setSelectedDriverInfo(driver);
      setValue('assignedDriverId', driver.uuid); // Исправлено
      showToast.success('Водитель выбран');
      saveDriverToHistory(driver);
    },
    [setValue, setSelectedVehicleType, setSelectedServiceLevel, saveDriverToHistory],
  );

  const handleDriverDeselect = useCallback(() => {
    setSelectedDriverInfo(null);
    setValue('assignedDriverId', ''); // Исправлено
    showToast.info('Водитель отменён');

    if (selectedVehicleType && selectedServiceLevel) {
      const index = driverHistoryRef.current.findIndex(
        (item) =>
          item.vehicleType === selectedVehicleType && item.serviceLevel === selectedServiceLevel,
      );
      if (index !== -1) {
        driverHistoryRef.current.splice(index, 1);
      }
    }
  }, [setValue, selectedVehicleType, selectedServiceLevel]);

  const handleDriverClick = useCallback(
    (driverId: string) => {
      if (selectedDriverInfo?.uuid === driverId) {
        handleDriverDeselect();
      } else {
        const selectedDriver = drivers?.find((driver) => driver.uuid === driverId);
        if (selectedDriver) {
          handleDriverSelect(selectedDriver);
        }
      }
    },
    [drivers, handleDriverSelect, handleDriverDeselect, selectedDriverInfo],
  );

  const handlePageChange = useCallback(
    (newPage: string) => {
      setPage(newPage);
    },
    [setPage],
  );

  return {
    drivers,
    searchDriver,
    isDriversLoading,
    selectedDriverInfo,
    page,
    perPage,
    total: currentTotal,
    serverTime,
    handleSearchDriverChange,
    handleSelectOpenChange,
    handleDriverSelect,
    handleDriverDeselect,
    handleDriverClick,
    handlePageChange,
    refetchDrivers,
  };
};
