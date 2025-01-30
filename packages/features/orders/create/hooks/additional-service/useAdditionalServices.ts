import { useState, useEffect, useCallback } from 'react';
import { fetchAdditionalServices } from '@features/orders/create/api/orderApi';
import { AdditionalService } from '@prisma/client';

interface UseAdditionalServicesProps {
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useAdditionalServices = ({ setErrorMessage }: UseAdditionalServicesProps) => {
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);

  const fetchAllAdditionalServices = useCallback(async () => {
    try {
      const servicesData = await fetchAdditionalServices();
      setAdditionalServices(servicesData);
    } catch (error) {
      setErrorMessage(error, 'Error fetching additional services');
    }
  }, [setErrorMessage]);

  useEffect(() => {
    fetchAllAdditionalServices();
  }, [fetchAllAdditionalServices]);

  return { additionalServices };
};
