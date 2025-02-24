import { useState, useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ServiceLevels, User, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { useUnit } from 'effector-react';
import {
  $selectedServiceLevel,
  $selectedVehicleType,
  $areValuesFromProps,
  setSelectedVehicleType,
  setSelectedServiceLevel,
} from '@shared/lib/effector/orders/stateStore';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { useDrivers } from '@features/orders/create/hooks/driver/useDrivers';

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
}

export const useOrderCreateDrivers = ({
  setValue,
  assignedDriverId,
}: UseOrderCreateDriversProps) => {
  // Берём данные из Effector
  const selectedVehicleType = useUnit($selectedVehicleType);
  const selectedServiceLevel = useUnit($selectedServiceLevel);
  const areValuesFromProps = useUnit($areValuesFromProps);

  const [searchDriver, setSearchDriver] = useState('');
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<ExtendedDriver | null>(null);
  const debouncedSearchDriver = useDebounce(searchDriver, 500);
  const selectOpenRef = useRef(false);
  const isInitialMount = useRef(true);
  const cancelledToastShownRef = useRef(false);
  const [currentTotal, setCurrentTotal] = useState(0);

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
    vehicleType: selectedVehicleType ?? undefined,
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

  const validateDriverCompatibility = useCallback(
    (driver: ExtendedDriver): boolean => {
      if (!driver.vehicleDriver?.vehicle) return false;
      const { vehicle } = driver.vehicleDriver;

      // Если areValuesFromProps === false, не проверяем совместимость
      if (!areValuesFromProps) return true;

      return (
        vehicle.vehicleType === selectedVehicleType &&
        (!selectedServiceLevel || vehicle.serviceLevels === selectedServiceLevel)
      );
    },
    [selectedVehicleType, selectedServiceLevel, areValuesFromProps],
  );

  useEffect(() => {
    if (selectedDriverInfo && !validateDriverCompatibility(selectedDriverInfo)) {
      if (!cancelledToastShownRef.current) {
        showToast.info('Водитель отменён');
        cancelledToastShownRef.current = true;
      }
      setSelectedDriverInfo(null);
      setValue('assignedDriverId', '');
    }
  }, [
    selectedDriverInfo,
    selectedVehicleType,
    selectedServiceLevel,
    setValue,
    validateDriverCompatibility,
  ]);

  useEffect(() => {
    if (assignedDriverId && assignedDriver) {
      if (validateDriverCompatibility(assignedDriver as ExtendedDriver)) {
        setSelectedDriverInfo(assignedDriver as ExtendedDriver);
        setValue('assignedDriverId', assignedDriver.uuid);
        cancelledToastShownRef.current = false;
      } else {
        if (!cancelledToastShownRef.current) {
          showToast.info('Водитель отменён');
          cancelledToastShownRef.current = true;
        }
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', '');
      }
    }
  }, [assignedDriverId, assignedDriver, setValue, validateDriverCompatibility]);

  useEffect(() => {
    if (isInitialMount.current && !searchDriver) {
      isInitialMount.current = false;
      return;
    }
    refetchDrivers(debouncedSearchDriver, selectedVehicleType ?? undefined, selectedServiceLevel);
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
        setValue('assignedDriverId', '');
        return;
      }

      const { vehicle } = driver.vehicleDriver;

      if (
        vehicle.vehicleType !== selectedVehicleType ||
        vehicle.serviceLevels !== selectedServiceLevel
      ) {
        setSelectedVehicleType(vehicle.vehicleType as VehicleType);
        setSelectedServiceLevel(vehicle.serviceLevels as ServiceLevels);
        setValue('vehicleType', vehicle.vehicleType as VehicleType);
        setValue('serviceLevel', vehicle.serviceLevels as ServiceLevels);
      }

      if (!validateDriverCompatibility(driver)) {
        setSelectedDriverInfo(null);
        setValue('assignedDriverId', '');
        return;
      }
      cancelledToastShownRef.current = false;
      setSelectedDriverInfo(driver);
      setValue('assignedDriverId', driver.uuid);
      showToast.success('Водитель выбран');
    },
    [
      setValue,
      validateDriverCompatibility,
      setSelectedVehicleType,
      setSelectedServiceLevel,
      selectedVehicleType,
      selectedServiceLevel,
    ],
  );

  const handleDriverDeselect = useCallback(() => {
    setSelectedDriverInfo(null);
    setValue('assignedDriverId', '');
    showToast.info('Водитель отменён');
  }, [setValue]);

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
  };
};
