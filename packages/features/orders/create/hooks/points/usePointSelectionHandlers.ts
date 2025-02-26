import { useState, useCallback, useEffect } from 'react';
import { Point } from '@prisma/client';

// Определяем тип PointWithoutTimestamps, как в usePointSelector
type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

interface PointSelectionHandlersProps {
  departurePoint?: PointWithoutTimestamps; // Обновили тип
  arrivalPoint?: PointWithoutTimestamps;   // Обновили тип
  additionalPoints: (PointWithoutTimestamps | null)[]; // Обновили тип
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
    (
      point: PointWithoutTimestamps, // Обновили тип
      currentSelector: 'departure' | 'arrival' | 'additional',
      additionalIndex?: number,
    ) => {
      if (!point) return false;

      // Проверка на совпадение с точкой отправления
      if (departurePoint?.uuid === point.uuid && currentSelector !== 'departure') {
        return true;
      }

      // Проверка на совпадение с точкой прибытия
      if (arrivalPoint?.uuid === point.uuid && currentSelector !== 'arrival') {
        return true;
      }

      // Проверка на наличие точки в дополнительных точках
      if (additionalPoints && additionalPoints.length > 0) {
        return additionalPoints.some(
          (p, index) =>
            p !== null &&
            p.uuid === point.uuid &&
            (currentSelector !== 'additional' || index !== additionalIndex),
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
    const filteredAdditionalPoints = additionalPoints.filter(
      (p): p is PointWithoutTimestamps => p !== null, // Уточняем тип с помощью type guard
    );
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

      const segmentCost = Math.round(
        avgDistancePerSegment * Number(fromPoint.pricePerKm) * Number(fromPoint.terrainDifficulty),
      );
      totalCost += segmentCost;
    }

    setRouteCost(totalCost);
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