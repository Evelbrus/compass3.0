import { useState, useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { OrderData } from '@features/orders/create/OrderCreate.logic';
import { ServiceLevels, VehicleType } from '@prisma/client';
import { useTariffs } from '@features/orders/create/hooks';
import { showToast } from '@shared/components/toast/ToastManager';
import { useUnit } from 'effector-react';
import {
  $selectedServiceLevel,
  $selectedVehicleType,
  setSelectedServiceLevel,
  setSelectedVehicleType,
} from '@shared/lib/effector/orders/stateStore';

interface UseOrderCreateHandlersProps {
  setValue: UseFormSetValue<OrderData>;
  selectedVehicleType?: VehicleType;
  selectedServiceLevel?: ServiceLevels;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useOrderConfiguration = ({
  setValue,
  selectedVehicleType: propSelectedVehicleType,
  selectedServiceLevel: propSelectedServiceLevel,
  setErrorMessage,
}: UseOrderCreateHandlersProps) => {
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);

  const effectorSelectedVehicleType = useUnit($selectedVehicleType);
  const effectorSelectedServiceLevel = useUnit($selectedServiceLevel);

  const effectiveSelectedVehicleType = effectorSelectedVehicleType;
  const effectiveSelectedServiceLevel = effectorSelectedServiceLevel;

  const [isLoadingTariff, setIsLoadingTariff] = useState<boolean>(true);

  const { updateTariffs: fetchTariffs } = useTariffs({
    selectedVehicleType: effectiveSelectedVehicleType,
    setErrorMessage,
  });

  const handleVehicleTypeChange = useCallback(
    (value: VehicleType | null) => {
      console.log('Vehicle type changed to:', value);
      setSelectedVehicleType(value);
      setSelectedServiceLevel(null);
      setValue('tariffUuid', '');
      setValue('tariff.vehicleType', value as VehicleType);
      setValue('tariff.serviceLevel', null as unknown as ServiceLevels);
      setSelectedTariff(null);
      fetchTariffs();
    },
    [setValue, fetchTariffs],
  );

  const handleServiceLevelChange = useCallback(
    (value: ServiceLevels | null) => {
      console.log('Service level changed to:', value);
      setSelectedServiceLevel(value);
      setValue('tariffUuid', '');
      setValue('tariff.serviceLevel', value as ServiceLevels);
      setSelectedTariff(null);
    },
    [setValue],
  );

  const handleTariffSelect = useCallback(
    (tariffUuid: string) => {
      console.log('Tariff selected:', tariffUuid);
      const foundTariff = tariffs.find((tariff) => tariff.uuid === tariffUuid);
      setSelectedTariff(foundTariff || null);
      setValue('tariffUuid', tariffUuid);
    },
    [tariffs, setValue],
  );

  //useEffect для инициализации effector store из пропсов
  useEffect(() => {
    if (propSelectedVehicleType) {
      setSelectedVehicleType(propSelectedVehicleType);
      setValue('tariff.vehicleType', propSelectedVehicleType);
    }

    if (propSelectedServiceLevel) {
      setSelectedServiceLevel(propSelectedServiceLevel);
      setValue('tariff.serviceLevel', propSelectedServiceLevel);
    }
  }, [propSelectedVehicleType, propSelectedServiceLevel, setValue]);

  useEffect(() => {
    if (effectiveSelectedVehicleType) {
      setIsLoadingTariff(true);
      fetchTariffs()
        .then((data) => {
          setTariffs(data);
          setIsLoadingTariff(false);
        })
        .catch((error) => {
          setErrorMessage(error, 'Ошибка при загрузке тарифов');
          setIsLoadingTariff(false);
        });
    }
  }, [effectiveSelectedVehicleType, fetchTariffs]);

  const previousTariffRef = useRef<ExtendedTariff | null>(null);

  useEffect(() => {
    if (!effectiveSelectedVehicleType || !effectiveSelectedServiceLevel || tariffs.length === 0) {
      setValue('tariffUuid', '');
      setSelectedTariff(null);
      previousTariffRef.current = null;
      return;
    }

    const foundTariff = tariffs.find(
      (tariff) =>
        tariff.vehicleType === effectiveSelectedVehicleType &&
        tariff.serviceLevel === effectiveSelectedServiceLevel,
    );

    if (foundTariff) {
      setValue('tariffUuid', foundTariff.uuid);
      setSelectedTariff(foundTariff);

      //Проверяем, изменился ли тариф
      if (previousTariffRef.current?.uuid !== foundTariff.uuid) {
        showToast.success(`Выбран тариф: ${foundTariff.vehicleType} - ${foundTariff.serviceLevel}`);
        previousTariffRef.current = foundTariff;
      }
    } else {
      setValue('tariffUuid', '');
      setSelectedTariff(null);

      //Показываем toast только если предыдущий тариф был выбран
      if (previousTariffRef.current !== null) {
        showToast.error('Тариф не найден');
        previousTariffRef.current = null;
      }
    }
  }, [effectiveSelectedVehicleType, effectiveSelectedServiceLevel, tariffs, setValue]);

  return {
    tariffs,
    isLoadingTariff,
    selectedTariff,
    selectedVehicleType: effectiveSelectedVehicleType,
    selectedServiceLevel: effectiveSelectedServiceLevel,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffSelect,
  };
};
