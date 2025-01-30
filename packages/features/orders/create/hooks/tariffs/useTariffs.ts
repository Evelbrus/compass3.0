import { useState, useCallback } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { fetchTariffs } from '@features/orders/create/api/orderApi';

interface UseTariffsProps {
  selectedServiceLevel?: string;
  selectedVehicleType?: string;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

interface UseTariffsResult {
  tariffs: ExtendedTariff[];
  updateTariffs: () => Promise<ExtendedTariff[]>;
}

export const useTariffs = ({
  selectedServiceLevel,
  selectedVehicleType,
  setErrorMessage,
}: UseTariffsProps): UseTariffsResult => {
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);

  const updateTariffs = useCallback(async (): Promise<ExtendedTariff[]> => {
    try {
      const tariffsData = await fetchTariffs(selectedServiceLevel, selectedVehicleType);
      setTariffs(tariffsData);
      return tariffsData;
    } catch (error) {
      setErrorMessage(error, 'Error fetching tariffs');
      return [];
    }
  }, [setErrorMessage, selectedServiceLevel, selectedVehicleType]);

  return {
    tariffs,
    updateTariffs,
  };
};
