import { useState, useEffect, useCallback } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { fetchTariffs } from '@features/orders/create/api/orderApi';

interface UseTariffsProps {
  selectedServiceLevel?: string;
  selectedVehicleType?: string;
  setErrorMessage: (error: any, message: string) => void;
}

export const useTariffs = ({
  selectedServiceLevel,
  selectedVehicleType,
  setErrorMessage,
}: UseTariffsProps) => {
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);

  const updateTariffs = useCallback(async () => {
    try {
      const tariffsData = await fetchTariffs(selectedServiceLevel, selectedVehicleType);
      setTariffs(tariffsData);
    } catch (error) {
      setErrorMessage(error, 'Error fetching tariffs');
    }
  }, [setErrorMessage, selectedServiceLevel, selectedVehicleType]);

  useEffect(() => {
    updateTariffs();
  }, [updateTariffs]);

  const handleTariffChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const foundTariff = tariffs.find((t) => t.uuid === e.target.value) || null;
      setSelectedTariff(foundTariff);
    },
    [tariffs],
  );

  return {
    tariffs,
    selectedTariff,
    updateTariffs,
    handleTariffChange,
  };
};
