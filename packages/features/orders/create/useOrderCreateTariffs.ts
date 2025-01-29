import { useTariffs } from '@features/orders/create/hooks';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';

interface UseOrderCreateTariffsProps {
  setErrorMessage: (error: any, message: string) => void;
}

interface UseOrderCreateTariffsResult {
  tariffs: ExtendedTariff[];
  updateTariffs: () => Promise<void>;
}

export const useOrderCreateTariffs = ({
  setErrorMessage,
}: UseOrderCreateTariffsProps): UseOrderCreateTariffsResult => {
  const { tariffs, updateTariffs } = useTariffs({
    selectedServiceLevel: '',
    selectedVehicleType: '',
    setErrorMessage,
  });

  return {
    tariffs,
    updateTariffs,
  };
};
