import { useState, useCallback } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { fetchTariffs } from '@features/orders/create/api/orderApi';
import { VehicleType } from '@prisma/client';

interface UseTariffsProps {
  selectedServiceLevel?: string;
  selectedVehicleType?: VehicleType | null;
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
      const tariffsData = await fetchTariffs(
        selectedServiceLevel,
        selectedVehicleType ?? undefined,
      );
      setTariffs(tariffsData);
      return tariffsData;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error : new Error(String(error)),
        'Error fetching tariffs',
      );
      return [];
    }
  }, [setErrorMessage, selectedServiceLevel, selectedVehicleType]);

  return {
    tariffs,
    updateTariffs,
  };
};
