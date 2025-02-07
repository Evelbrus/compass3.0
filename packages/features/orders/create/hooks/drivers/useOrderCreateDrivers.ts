import { useState, useCallback, useEffect, useRef } from 'react';
import { useDrivers } from '@features/orders/create/hooks';
import useDebounce from '@shared/utils/hooks/useDebounce';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { User } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { useUnit } from 'effector-react';
import {
  $selectedServiceLevel,
  $selectedVehicleType,
  $areValuesFromProps,
  setSelectedVehicleType,
  setSelectedServiceLevel,
} from '@shared/lib/effector/orders/stateStore';

export interface ExtendedDriver extends User {
  vehicleDriver?: {
    vehicle: {
      serviceLevels: string;
      vehicleType: string;
    };
  };
}

interface UseOrderCreateDriversProps {
  setValue: UseFormSetValue<CreateOrderData>;
  watch: UseFormWatch<CreateOrderData>;
  assignedDriverId?: string | null;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useOrderCreateDrivers = ({
  setValue,
  watch,
  assignedDriverId,
  setErrorMessage,
}: UseOrderCreateDriversProps) => {
  //Берем данные из Effector
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
    vehicleType: selectedVehicleType,
    serviceLevel: selectedServiceLevel,
    setErrorMessage,
    search: debouncedSearchDriver,
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

      //If areValuesFromProps = false, do NOT check compatibility
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
    refetchDrivers(debouncedSearchDriver, selectedVehicleType, selectedServiceLevel);
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
      setPage(1);
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

      //Проверяем, нужно ли обновлять значения в effector store
      if (
        vehicle.vehicleType !== selectedVehicleType ||
        vehicle.serviceLevels !== selectedServiceLevel
      ) {
        setSelectedVehicleType(vehicle.vehicleType);
        setSelectedServiceLevel(vehicle.serviceLevels);
        //Явно устанавливаем значения в react-hook-form
        setValue('tariff.vehicleType', vehicle.vehicleType);
        setValue('tariff.serviceLevel', vehicle.serviceLevels);
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
    (newPage: number) => {
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
    currentTotal,
    serverTime,
    handleSearchDriverChange,
    handleSelectOpenChange,
    handleDriverSelect,
    handleDriverDeselect,
    handleDriverClick,
    handlePageChange,
  };
};
