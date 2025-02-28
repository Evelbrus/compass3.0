import { useState, useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ServiceLevels, User, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { useDrivers } from '@features/orders/create/hooks/driver/useDrivers';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

// Расширенный интерфейс для водителя
export interface ExtendedDriver extends User {
  vehicleDriver?: {
    vehicle: {
      serviceLevels: string;
      vehicleType: string;
    };
  };
}

// Интерфейс пропсов хука
interface UseOrderCreateDriversProps {
  setValue: UseFormSetValue<FormOrderValues>;
  assignedDriverId?: string | null;
  selectedVehicleType: string | null;
  selectedServiceLevel: string | null;
  setSelectedVehicleType: (type: VehicleType) => void;
  setSelectedServiceLevel: (level: ServiceLevels) => void;
}

// Интерфейс для хранения истории выбора водителей
interface DriverHistoryItem {
  vehicleType: VehicleType;
  serviceLevel: ServiceLevels;
  driver: ExtendedDriver;
}

// Основной хук
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

  // Получение данных водителей из другого хука
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

  // Обновление общего количества водителей
  useEffect(() => {
    setCurrentTotal(total);
  }, [total]);

  // Загрузка данных назначенного водителя
  useEffect(() => {
    if (assignedDriverId) {
      fetchAssignedDriverData(assignedDriverId);
    }
  }, [assignedDriverId, fetchAssignedDriverData]);

  // Получение доступных уровней обслуживания для типа транспорта
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

  // Проверка совместимости водителя с текущими параметрами
  const validateDriverCompatibility = useCallback(
    (driver: ExtendedDriver): boolean => {
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

  // Сохранение водителя в историю
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

  // Поиск водителя в истории
  const findDriverInHistory = useCallback(() => {
    if (!selectedVehicleType || !selectedServiceLevel) return null;
    return (
      driverHistoryRef.current.find(
        (item) =>
          item.vehicleType === selectedVehicleType && item.serviceLevel === selectedServiceLevel,
      )?.driver || null
    );
  }, [selectedVehicleType, selectedServiceLevel]);

  // Отслеживание изменений параметров и проверка совместимости
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
        setValue('assignedDriverId', { assignedDriverId: '' });

        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', { assignedDriverId: historyDriver.uuid });
          showToast.success('Водитель восстановлен из истории');
          cancelledToastShownRef.current = false;
        }
      } else if (!selectedDriverInfo) {
        const historyDriver = findDriverInHistory();
        if (historyDriver) {
          setSelectedDriverInfo(historyDriver);
          setValue('assignedDriverId', { assignedDriverId: historyDriver.uuid });
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

  // Автоматический выбор первого доступного уровня обслуживания
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

  // Обработка назначенного водителя
  useEffect(() => {
    if (assignedDriverId && assignedDriver) {
      const driver = assignedDriver as ExtendedDriver;
      const isCompatible = validateDriverCompatibility(driver);

      if (isCompatible) {
        setSelectedDriverInfo(driver);
        setValue('assignedDriverId', { assignedDriverId: driver.uuid });

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
        setValue('assignedDriverId', { assignedDriverId: '' });
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

  // Обновление списка водителей при поиске или смене страницы
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

  // Обработчики событий
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
        setValue('assignedDriverId', { assignedDriverId: '' });
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
      setValue('assignedDriverId', { assignedDriverId: driver.uuid });
      showToast.success('Водитель выбран');
      saveDriverToHistory(driver);
    },
    [setValue, setSelectedVehicleType, setSelectedServiceLevel, saveDriverToHistory],
  );

  const handleDriverDeselect = useCallback(() => {
    setSelectedDriverInfo(null);
    setValue('assignedDriverId', { assignedDriverId: '' });
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

  // Возвращаемые значения
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
