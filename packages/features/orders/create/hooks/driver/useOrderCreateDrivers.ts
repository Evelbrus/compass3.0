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

interface UseDriversProps {
  vehicleType: string | null;
  serviceLevel: string | null;
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
  const pendingRequestRef = useRef(false);
  const driverHistoryRef = useRef<DriverHistoryItem[]>([]);
  const skipInitialFetchRef = useRef(true);
  const parametersSetRef = useRef<boolean>(false);

  // Создаем стабильную версию объекта с параметрами для хука useDrivers
  const driversHookParams = useRef<UseDriversProps>({
    vehicleType: null,
    serviceLevel: null
  });

  // Только обновляем параметры, если они действительно изменились
  if (driversHookParams.current.vehicleType !== selectedVehicleType || 
      driversHookParams.current.serviceLevel !== selectedServiceLevel) {
    driversHookParams.current = {
      vehicleType: selectedVehicleType,
      serviceLevel: selectedServiceLevel
    };
    parametersSetRef.current = Boolean(selectedVehicleType && selectedServiceLevel);
  }

  // Используем стабильный объект параметров
  const driversPayload = useDrivers(driversHookParams.current);

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
  } = driversPayload;

  const drivers = rawDrivers as Driver[] | undefined;

  useEffect(() => {
    setCurrentTotal(total);
  }, [total]);

  useEffect(() => {
    if (assignedDriverId && !isDriversLoading && !pendingRequestRef.current) {
      fetchAssignedDriverData(assignedDriverId);
    }
  }, [assignedDriverId, fetchAssignedDriverData, isDriversLoading]);

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
    // Пропускаем первую инициализацию
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    
    // Проверяем, изменились ли параметры
    if (
      (selectedVehicleType === lastVehicleTypeRef.current &&
      selectedServiceLevel === lastServiceLevelRef.current) ||
      pendingRequestRef.current ||
      !parametersSetRef.current
    ) {
      return;
    }

    pendingRequestRef.current = true;
    
    lastVehicleTypeRef.current = selectedVehicleType as VehicleType;
    lastServiceLevelRef.current = selectedServiceLevel as ServiceLevels;

    if (selectedDriverInfo && !validateDriverCompatibility(selectedDriverInfo)) {
      if (!cancelledToastShownRef.current) {
        showToast.info('Водитель отменён из-за изменения параметров');
        cancelledToastShownRef.current = true;
      }
      setSelectedDriverInfo(null);
      setValue('assignedDriverId', '');

      const historyDriver = findDriverInHistory();
      if (historyDriver) {
        setSelectedDriverInfo(historyDriver);
        setValue('assignedDriverId', historyDriver.uuid);
        showToast.success('Водитель восстановлен из истории');
        cancelledToastShownRef.current = false;
      }
    } else if (!selectedDriverInfo) {
      const historyDriver = findDriverInHistory();
      if (historyDriver) {
        setSelectedDriverInfo(historyDriver);
        setValue('assignedDriverId', historyDriver.uuid);
        showToast.success('Водитель восстановлен из истории');
        cancelledToastShownRef.current = false;
      }
    }

    if (selectedVehicleType && selectedServiceLevel) {
      const vehicleTypeValue = selectedVehicleType as VehicleType;
      const serviceLevelValue = selectedServiceLevel as ServiceLevels;
      
      refetchDrivers('', vehicleTypeValue, serviceLevelValue);
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 300);
    } else {
      pendingRequestRef.current = false;
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
    if (pendingRequestRef.current || !selectedVehicleType || !drivers?.length) {
      return;
    }
    
    const availableServiceLevels = getAvailableServiceLevelsForVehicleType(
      selectedVehicleType as VehicleType,
    );
    
    if (
      availableServiceLevels.length > 0 &&
      (!selectedServiceLevel ||
        !availableServiceLevels.includes(selectedServiceLevel as ServiceLevels))
    ) {
      pendingRequestRef.current = true;
      const firstServiceLevel = availableServiceLevels[0];
      if (firstServiceLevel) {
        setSelectedServiceLevel(firstServiceLevel);
        setValue('serviceLevel', firstServiceLevel);
      }
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 300);
    }
  }, [
    drivers,
    setValue,
    setSelectedServiceLevel,
    getAvailableServiceLevelsForVehicleType,
    selectedVehicleType,
    selectedServiceLevel
  ]);

  useEffect(() => {
    if (!assignedDriverId || !assignedDriver || pendingRequestRef.current) {
      return;
    }

    const driver = assignedDriver as Driver;
    const isCompatible = validateDriverCompatibility(driver);

    if (isCompatible) {
      setSelectedDriverInfo(driver);
      setValue('assignedDriverId', driver.uuid);

      if (driver.vehicleDriver?.vehicle) {
        const vehicleType = driver.vehicleDriver.vehicle.vehicleType as VehicleType;
        const serviceLevel = driver.vehicleDriver.vehicle.serviceLevels as ServiceLevels;

        pendingRequestRef.current = true;
        setSelectedVehicleType(vehicleType);
        setValue('vehicleType', vehicleType);
        setSelectedServiceLevel(serviceLevel);
        setValue('serviceLevel', serviceLevel);
        saveDriverToHistory(driver);
        
        setTimeout(() => {
          pendingRequestRef.current = false;
        }, 300);
      }
    } else {
      if (!cancelledToastShownRef.current) {
        showToast.info('Водитель отменён из-за несовместимости с выбранными параметрами');
        cancelledToastShownRef.current = true;
      }
      setSelectedDriverInfo(null);
      setValue('assignedDriverId', '');
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
    // Пропускаем первую инициализацию и проверяем другие условия
    if (
      isInitialMount.current || 
      !searchDriver || 
      pendingRequestRef.current || 
      !selectedVehicleType || 
      !selectedServiceLevel
    ) {
      isInitialMount.current = false;
      return;
    }

    pendingRequestRef.current = true;

    const vehicleTypeValue = selectedVehicleType as VehicleType;
    const serviceLevelValue = selectedServiceLevel as ServiceLevels;
    
    refetchDrivers(debouncedSearchDriver, vehicleTypeValue, serviceLevelValue);
    setTimeout(() => {
      pendingRequestRef.current = false;
    }, 300);
  }, [
    debouncedSearchDriver,
    refetchDrivers,
    selectedVehicleType,
    selectedServiceLevel,
  ]);

  // Отдельный эффект для реагирования на изменение страницы
  useEffect(() => {
    if (
      pendingRequestRef.current || 
      !selectedVehicleType || 
      !selectedServiceLevel || 
      isInitialMount.current
    ) {
      return;
    }

    pendingRequestRef.current = true;
    const vehicleTypeValue = selectedVehicleType as VehicleType;
    const serviceLevelValue = selectedServiceLevel as ServiceLevels;
    
    refetchDrivers(debouncedSearchDriver, vehicleTypeValue, serviceLevelValue);
    setTimeout(() => {
      pendingRequestRef.current = false;
    }, 300);
  }, [page, perPage, refetchDrivers, selectedVehicleType, selectedServiceLevel, debouncedSearchDriver]);

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
        setValue('assignedDriverId', '');
        return;
      }

      const { vehicle } = driver.vehicleDriver;
      const vehicleType = vehicle.vehicleType as VehicleType;
      const serviceLevel = vehicle.serviceLevels as ServiceLevels;

      pendingRequestRef.current = true;

      setSelectedVehicleType(vehicleType);
      setValue('vehicleType', vehicleType);
      setSelectedServiceLevel(serviceLevel);
      setValue('serviceLevel', serviceLevel);

      setSelectedDriverInfo(driver);
      setValue('assignedDriverId', driver.uuid);
      showToast.success('Водитель выбран');
      saveDriverToHistory(driver);

      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 300);
    },
    [setValue, setSelectedVehicleType, setSelectedServiceLevel, saveDriverToHistory],
  );

  const handleDriverDeselect = useCallback(() => {
    setSelectedDriverInfo(null);
    setValue('assignedDriverId', '');
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
