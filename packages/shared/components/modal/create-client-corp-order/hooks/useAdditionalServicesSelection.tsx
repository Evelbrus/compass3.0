import { useState, useEffect } from 'react';
import { AdditionalService } from '@prisma/client';
import { useApi } from '@shared/components/modal/create-client-corp-order/api/useApi';

interface UseAdditionalServicesReturn {
  additionalServices: AdditionalService[];
  loading: boolean;
  error: string | null;
}

const useAdditionalServices = (): UseAdditionalServicesReturn => {
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchAdditionalServices } = useApi();

  useEffect(() => {
    const loadAdditionalServices = async () => {
      try {
        setLoading(true);
        const data = await fetchAdditionalServices();
        setAdditionalServices(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching additional services:', error);
        setError(error instanceof Error ? error.message : 'Failed to load additional services');
      } finally {
        setLoading(false);
      }
    };

    loadAdditionalServices();
  }, [fetchAdditionalServices]);

  return {
    additionalServices,
    loading,
    error,
  };
};

export default useAdditionalServices;
