import { useState, useEffect } from 'react';
import { fetchAdditionalServices } from '@features/orders/create/api/orders.api';
import { AdditionalService } from '@prisma/client';

export const useAllAdditionalServices = () => {
  const [allServices, setAllServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех дополнительных услуг
  useEffect(() => {
    const fetchData = async () => {
      try {
        const services = await fetchAdditionalServices();
        setAllServices(services);
      } catch (err: unknown) {
        console.error('Failed to fetch additional services:', err);
        if (err instanceof Error) {
          setError(err.message || 'Не удалось загрузить дополнительные услуги');
        } else {
          setError('Не удалось загрузить дополнительные услуги');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { allServices, loading, error };
};
