import { useState, useCallback, useEffect } from 'react';
import { Point } from '@prisma/client';

interface PointSelectionHandlersProps {
  departurePoint?: Point;
  arrivalPoint?: Point;
  additionalPoints: (Point | null)[];
  routeDistance: number;
}

const usePointSelectionHandlers = ({
  departurePoint,
  arrivalPoint,
  additionalPoints,
  routeDistance,
}: PointSelectionHandlersProps) => {
  const [routeCost, setRouteCost] = useState<number>(0);

  const isPointAlreadySelected = useCallback(
    (point: Point, type: 'departure' | 'arrival' | 'additional', index?: number) => {
      if (type === 'departure')
        return (
          arrivalPoint?.uuid === point.uuid || additionalPoints.some((p) => p?.uuid === point.uuid)
        );
      if (type === 'arrival')
        return (
          departurePoint?.uuid === point.uuid ||
          additionalPoints.some((p) => p?.uuid === point.uuid)
        );
      if (type === 'additional' && typeof index === 'number') {
        return (
          departurePoint?.uuid === point.uuid ||
          arrivalPoint?.uuid === point.uuid ||
          additionalPoints.some((p, i) => i !== index && p?.uuid === point.uuid)
        );
      }
      return false;
    },
    [departurePoint, arrivalPoint, additionalPoints],
  );

  const calculateRouteCost = useCallback(() => {
    if (!departurePoint || !arrivalPoint || routeDistance === 0) {
      setRouteCost(0);
      return;
    }

    // Формируем маршрут: отправление → дополнительные точки → прибытие
    const filteredAdditionalPoints = additionalPoints.filter((p): p is Point => p !== null);
    const allPointsInRoute = [
      departurePoint, // Начало: точка отправления
      ...filteredAdditionalPoints, // Середина: дополнительные точки в порядке выбора
      arrivalPoint, // Конец: точка прибытия
    ];

    if (allPointsInRoute.length < 2) {
      setRouteCost(0);
      return;
    }

    const segmentCount = allPointsInRoute.length - 1; // Количество сегментов
    const avgDistancePerSegment = routeDistance / segmentCount;

    let totalCost = 0;

    for (let i = 0; i < segmentCount; i++) {
      const fromPoint = allPointsInRoute[i];
      if (!fromPoint) {
        console.warn(`Точка на индексе ${i} не определена`);
        continue;
      }
      console.log(`Сегмент ${i + 1}: от ${fromPoint.address}`);
      console.log(`Цена за километр: ${fromPoint.pricePerKm}`);
      console.log(`Коэффициент сложности: ${fromPoint.terrainDifficulty}`);
      console.log(`Расстояние сегмента (среднее): ${avgDistancePerSegment} км`);

      const segmentCost = Math.round(
        avgDistancePerSegment * Number(fromPoint.pricePerKm) * Number(fromPoint.terrainDifficulty),
      );
      totalCost += segmentCost;
      console.log(`Стоимость сегмента: ${segmentCost}`);
    }

    setRouteCost(totalCost);
    console.log(`Общая стоимость маршрута: ${totalCost}`);
  }, [departurePoint, arrivalPoint, additionalPoints, routeDistance]);

  useEffect(() => {
    calculateRouteCost();
  }, [calculateRouteCost]);

  return {
    isPointAlreadySelected,
    routeCost,
  };
};

export default usePointSelectionHandlers;
