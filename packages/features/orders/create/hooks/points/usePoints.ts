import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchPoints, fetchPointsByUuids } from '@features/orders/create/api/orderApi';
import { Point } from '@prisma/client';

interface UsePointsProps {
  per_page?: number;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const usePoints = ({ setErrorMessage, per_page = 4 }: UsePointsProps) => {
  const [points, setPoints] = useState<Point[] | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const prevSearchRef = useRef<string | undefined>(undefined);

  const fetchAllPoints = useCallback(
    async (searchQuery: string = '', page: number = 1) => {
      try {
        setIsLoading(true);

        if (prevSearchRef.current === searchQuery && page === 1) return;
        prevSearchRef.current = searchQuery;

        const response = await fetchPoints(searchQuery, page.toString(), per_page.toString());

        setTotal(response.total);
        setPoints((prev) => (page === 1 ? response.points : [...(prev || []), ...response.points]));
      } catch (error) {
        setErrorMessage(error as Error, 'Error fetching points');
        setPoints(null);
      } finally {
        setIsLoading(false);
      }
    },
    [per_page, setErrorMessage],
  );

  const refetchPoints = useCallback(
    (searchQuery: string = '') => {
      setCurrentPage(1);
      fetchAllPoints(searchQuery, 1);
    },
    [fetchAllPoints],
  );

  const fetchPointsByUuidsCallback = useCallback(
    async (uuids: string[]): Promise<Point[] | null> => {
      try {
        const pointsData = await fetchPointsByUuids(uuids);
        setPoints(pointsData);
        return pointsData;
      } catch (error) {
        setErrorMessage(error as Error, 'Ошибка при получении точек по UUID');
        return null;
      }
    },
    [setErrorMessage],
  );

  const loadMore = useCallback(() => {
    const hasMore = points ? points.length < total : false;
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAllPoints(prevSearchRef.current || '', nextPage);
    }
  }, [isLoading, currentPage, fetchAllPoints, total, points]);

  //Сброс currentPage при изменении searchQuery
  useEffect(() => {
    if (prevSearchRef.current !== undefined) {
      setCurrentPage(1);
    }
  }, [prevSearchRef.current]);

  return {
    points,
    refetchPoints,
    fetchPointsByUuidsCallback,
    total,
    loadMore,
    currentPage,
  };
};
