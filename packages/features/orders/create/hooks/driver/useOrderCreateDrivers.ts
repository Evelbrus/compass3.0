import { useState, useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ServiceLevels, User, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { useDrivers } from '@features/orders/create/hooks/driver/useDrivers';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

export interface ExtendedDriver extends User {
  vehicleDriver?: {
    vehicle: {
      serviceLevels: string;
      vehicleType: string;
    };
  };
}

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
  driver: ExtendedDriver;
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
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<ExtendedDriver | null>(null);
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

  const drivers: ExtendedDriver[] | undefined = rawDrivers as ExtendedDriver[];

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
    (driver: ExtendedDriver): boolean => {
      if (!driver.vehicleDriver?.vehicle) return false;
      const { vehicle } = driver.vehicleDriver;

      console.log('Проверка совместимости водителя:');
      console.log('Водитель:', driver.fullName);
      console.log('Транспорт водителя:', vehicle.vehicleType);
      console.log('Уровень водителя:', vehicle.serviceLevels);
      console.log('Выбранный транспорт:', selectedVehicleType);
      console.log('Выбранный уровень:', selectedServiceLevel);

      if (!selectedVehicleType || !selectedServiceLevel) {
        console.log('Начальная загрузка, считаем водителя совместимым');
        return true;
      }

      const isCompatible =
        vehicle.vehicleType === selectedVehicleType &&
        vehicle.serviceLevels === selectedServiceLevel;

      console.log('Совместим:', isCompatible);
      return isCompatible;
    },
    [selectedVehicleType, selectedServiceLevel],
  );

  const saveDriverToHistory = useCallback((driver: ExtendedDriver) => {
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

      if (selectedDriverInfo) {
        if (
          selectedDriverInfo.vehicleDriver?.vehicle?.vehicleType === selectedVehicleType &&
          selectedDriverInfo.vehicleDriver?.vehicle?.serviceLevels === selectedServiceLevel
        ) {
          saveDriverToHistory(selectedDriverInfo);
        }
      }

      if (selectedDriverInfo && !validateDriverCompatibility(selectedDriverInfo)) {
        if (!cancelledToastShownRef.current) {
          showToast.info('Водитель отменён из-за изменения параметров');
          cancelledToastShownRef.current = true;
        }
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', { assignedDriverId: '' }); // Исправлено: объект вместо строки

        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', { assignedDriverId: historyDriver.uuid }); // Исправлено: объект вместо строки
          showToast.success('Водитель восстановлен из истории');
          cancelledToastShownRef.current = false;
        }
      } else if (!selectedDriverInfo) {
        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', { assignedDriverId: historyDriver.uuid }); // Исправлено: объект вместо строки
          showToast.success('Водитель восстановлен из истории');
          cancelledToastShownRef.current = false;
        }
      }

      if (selectedVehicleType) {
        // Исправлено: приведение типов и проверка на undefined
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
    saveDriverToHistory,
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
          // Исправлено: проверка на null/undefined
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
      console.log(
        'Проверка совместимости назначенного водителя:',
        (assignedDriver as ExtendedDriver).fullName,
      );
      console.log('Текущий тип транспорта:', selectedVehicleType);
      console.log('Текущий уровень услуг:', selectedServiceLevel);

      const driver = assignedDriver as ExtendedDriver;
      const isCompatible = validateDriverCompatibility(driver);

      if (isCompatible) {
        setSelectedDriverInfo(driver);
        setValue('assignedDriverId', { assignedDriverId: driver.uuid }); // Исправлено: объект вместо строки

        if (driver.vehicleDriver?.vehicle) {
          const vehicleType = driver.vehicleDriver.vehicle.vehicleType as VehicleType;
          const serviceLevel = driver.vehicleDriver.vehicle.serviceLevels as ServiceLevels;

          console.log(
            'Устанавливаем тип транспорта и уровень услуг от водителя:',
            vehicleType,
            serviceLevel,
          );

          if (vehicleType) {
            // Исправлено: проверка на null/undefined
            setSelectedVehicleType(vehicleType);
            setValue('vehicleType', vehicleType);
          }

          if (serviceLevel) {
            // Исправлено: проверка на null/undefined
            setSelectedServiceLevel(serviceLevel);
            setValue('serviceLevel', serviceLevel);
          }

          saveDriverToHistory(driver);
        }
      } else {
        if (!cancelledToastShownRef.current) {
          showToast.info('Водитель отменён из-за несовместимости с выбранными параметрами');
          cancelledToastShownRef.current = true;
        }
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', { assignedDriverId: '' }); // Исправлено: объект вместо строки
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

    // Исправлено: приведение типов для аргументов функции
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
    (driver: ExtendedDriver) => {
      if (!driver.vehicleDriver?.vehicle) {
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', { assignedDriverId: '' }); // Исправлено: объект вместо строки
        return;
      }

      const { vehicle } = driver.vehicleDriver;

      if (
        vehicle.vehicleType !== selectedVehicleType ||
        vehicle.serviceLevels !== selectedServiceLevel
      ) {
        const vehicleType = vehicle.vehicleType as VehicleType;
        const serviceLevel = vehicle.serviceLevels as ServiceLevels;

        if (vehicleType) {
          // Исправлено: проверка на null/undefined
          setSelectedVehicleType(vehicleType);
          setValue('vehicleType', vehicleType);
        }

        if (serviceLevel) {
          // Исправлено: проверка на null/undefined
          setSelectedServiceLevel(serviceLevel);
          setValue('serviceLevel', serviceLevel);
        }
      }

      if (!validateDriverCompatibility(driver)) {
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', { assignedDriverId: '' }); // Исправлено: объект вместо строки
        return;
      }

      cancelledToastShownRef.current = false;
      setSelectedDriverInfo(driver);
      setValue('assignedDriverId', { assignedDriverId: driver.uuid }); // Исправлено: объект вместо строки
      showToast.success('Водитель выбран');
      saveDriverToHistory(driver);
    },
    [
      setValue,
      validateDriverCompatibility,
      setSelectedVehicleType,
      setSelectedServiceLevel,
      selectedVehicleType,
      selectedServiceLevel,
      saveDriverToHistory,
    ],
  );

  const handleDriverDeselect = useCallback(() => {
    setSelectedDriverInfo(null);
    setValue('assignedDriverId', { assignedDriverId: '' }); // Исправлено: объект вместо строки
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
