import { useState, useEffect, useRef } from 'react';
import { fetchTariffs } from '@shared/components/modal/create-client-corp-order/api/useApi';
import { Tariff } from '@prisma/client';

const useTariffs = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
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
  }, []); // Пустой массив зависимостей - загрузка только при монтировании

  return { tariffs, loading, error, isInitialMount };
};

export default useTariffs;
