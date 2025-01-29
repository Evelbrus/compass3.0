import { useState, useCallback, useEffect } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import {
  calculateTotalPrice,
  handleAdditionalServiceChange,
} from '@features/orders/create/helpers';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface UseOrderCreateHandlersProps {
  setValue: UseFormSetValue<CreateOrderData>;
  watch: UseFormWatch<CreateOrderData>;
  tariffs: ExtendedTariff[];
  points: any[];
  setErrorMessage: (error: any, message: string) => void;
}

export const useOrderCreateHandlers = ({
  setValue,
  watch,
  tariffs,
  points,
  setErrorMessage,
}: UseOrderCreateHandlersProps) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('');
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);

  const handleVehicleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicleType(e.target.value);
  }, []);

  const handleServiceLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceLevel(e.target.value);
  }, []);

  useEffect(() => {
    if (selectedTariff && !tariffs.some((t) => t.uuid === selectedTariff.uuid)) {
      setSelectedTariff(null);
      setSelectedAdditionalServices([]);
      setValue('tariffUuid', '');
      setValue('basePrice', 0);
    }
  }, [tariffs, selectedTariff, setValue]);

  const handleTariffChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const foundTariff = tariffs.find((t) => t.uuid === e.target.value) || null;
      setSelectedTariff(foundTariff);

      if (foundTariff) {
        setValue('tariffUuid', foundTariff.uuid);
        setValue(
          'basePrice',
          calculateTotalPrice({
            selectedTariff: foundTariff,
            selectedAdditionalServices,
            intermediatePoints: watch().intermediatePoints || [],
            arrivalPointUuid: watch().arrivalPoint,
            points,
          }),
        );
        setSelectedAdditionalServices([]);
      } else {
        setValue('tariffUuid', '');
        setValue('basePrice', 0);
      }
    },
    [tariffs, points, setValue, selectedAdditionalServices, watch],
  );

  const handleAdditionalServiceChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      const newServices = handleAdditionalServiceChange(
        e.target.checked,
        serviceUuid,
        selectedAdditionalServices,
      );
      setSelectedAdditionalServices(newServices);
      if (selectedTariff) {
        const newPrice = calculateTotalPrice({
          selectedTariff,
          selectedAdditionalServices: newServices,
          intermediatePoints: watch().intermediatePoints || [],
          arrivalPointUuid: watch().arrivalPoint,
          points,
        });
        setValue('basePrice', newPrice);
      }
    },
    [selectedAdditionalServices, setValue, selectedTariff, watch, points],
  );

  return {
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffChange,
    handleAdditionalServiceChangeCallback,
  };
};
