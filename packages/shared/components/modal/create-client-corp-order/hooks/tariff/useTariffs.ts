//useTariffs.ts
import { useState, useEffect, useRef } from 'react';
import { fetchTariffs } from '@shared/components/modal/create-client-corp-order/api/useApi';
import { ServiceLevels, VehicleType } from '@prisma/client';
import { TariffWithServices } from '@shared/components/modal/create-client-corp-order/CreateClientCorpOrder';

interface UseTariffsProps {
  serviceLevel?: ServiceLevels;
  vehicleType?: VehicleType;
}

const useTariffs = ({ serviceLevel, vehicleType }: UseTariffsProps = {}) => {
  const [tariffs, setTariffs] = useState<TariffWithServices[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialMount = useRef(true);
  const isInitialMount = initialMount.current;

  useEffect(() => {
    const loadTariffs = async () => {
      try {
        setLoading(true);
        const data = await fetchTariffs(undefined, vehicleType);
        setTariffs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching tariffs:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tariffs');
        setTariffs([]);
      } finally {
        setLoading(false);
      }
    };
    if (initialMount.current) {
      loadTariffs();
      initialMount.current = false;
    } else if (vehicleType) {
      loadTariffs();
    }
  }, [serviceLevel, vehicleType]);

  return { tariffs, loading, error, isInitialMount };
};

export default useTariffs;
