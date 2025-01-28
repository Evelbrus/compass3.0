import { useState, useEffect, useCallback } from 'react';
import { fetchPoints } from '@features/orders/create/api/orderApi';
import { Point } from '@prisma/client';

interface UsePointsProps {
  setErrorMessage: (error: any, message: string) => void;
}

export const usePoints = ({ setErrorMessage }: UsePointsProps) => {
  const [points, setPoints] = useState<Point[]>([]);

  const fetchAllPoints = useCallback(async () => {
    try {
      const pointsData = await fetchPoints();
      setPoints(pointsData);
    } catch (error) {
      setErrorMessage(error, 'Error fetching points');
    }
  }, [setErrorMessage]);

  useEffect(() => {
    fetchAllPoints();
  }, [fetchAllPoints]);

  const getAvailablePoints = useCallback(
    (excludePoints: string[]) => {
      return points.filter((point) => !excludePoints.includes(point.uuid));
    },
    [points],
  );

  return { points, getAvailablePoints };
};
