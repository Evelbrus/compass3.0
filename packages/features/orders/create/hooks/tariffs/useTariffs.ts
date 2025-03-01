import { useState, useEffect, useRef } from 'react';
import { fetchTariffs } from '@features/orders/create/api/orders.api';
import { Tariff, TariffOnService } from '@prisma/client';

export const useTariffs = () => {
  const [tariffs, setTariffs] = useState<
    (Tariff & { tariffAdditionalServices: TariffOnService[] })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialMount = useRef(true);
  const isInitialMount = initialMount.current;

  useEffect(() => {
    const loadTariffs = async () => {
      try {
        setLoading(true);
        // Всегда загружаем все тарифы, без фильтрации по vehicleType
        const data = await fetchTariffs(undefined, undefined);
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

    // Загружаем тарифы только при первой монтировке компонента
    if (initialMount.current) {
      loadTariffs();
      initialMount.current = false;
    }
  }, []);

  return { tariffs, loading, error, isInitialMount };
};
