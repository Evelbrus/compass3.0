import { useState, useEffect } from 'react';
import { fetchPoints, FetchPointsResponse } from '@features/orders/create/api/orders.api';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

export const useAllPoints = () => {
  const [allPoints, setAllPoints] = useState<PointWithoutTimestamps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPoints('', '1', '1000', 'createdAt', 'asc')
      .then((response: FetchPointsResponse) => {
        if (!response.points || !Array.isArray(response.points)) {
          throw new Error('API вернул неправильный формат данных');
        }
        setAllPoints(response.points);
      })
      .catch((err) => {
        console.error('Ошибка при получении всех точек:', err);
        setError('Не удалось загрузить точки');
      })
      .finally(() => setLoading(false));
  }, []);

  return { allPoints, loading, error };
};
