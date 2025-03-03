import { useState, useCallback, useEffect } from 'react';
import { showToast } from '@shared/components/toast/ToastManager';
import { UseFormSetValue } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

interface PointSelectionHandlersProps {
  departurePoint?: PointWithoutTimestamps | null;
  arrivalPoint?: PointWithoutTimestamps | null;
  additionalPoints: (PointWithoutTimestamps | null)[];
  routeDistance: number;
  onSelectDeparture: (point: PointWithoutTimestamps | null) => void;
  onSelectArrival: (point: PointWithoutTimestamps | null) => void;
  onSelectAdditional: (point: PointWithoutTimestamps | null, index: number) => void;
  setFormValue: UseFormSetValue<FormOrderValues>;
}

export const usePointSelectionHandlers = ({
  departurePoint,
  arrivalPoint,
  additionalPoints,
  routeDistance,
  onSelectDeparture,
  onSelectArrival,
  onSelectAdditional,
  setFormValue,
}: PointSelectionHandlersProps) => {
  const [routeCost, setRouteCost] = useState<number>(0);

  const isPointAlreadySelected = useCallback(
    (
      point: PointWithoutTimestamps,
      currentSelector: 'departure' | 'arrival' | 'additional',
      additionalIndex?: number,
    ) => {
      if (!point) return false;

      // Проверка точки отправления
      if (departurePoint?.uuid === point.uuid && currentSelector !== 'departure') {
        return true;
      }
      // Проверка точки прибытия
      if (arrivalPoint?.uuid === point.uuid && currentSelector !== 'arrival') {
        return true;
      }
      // Проверка дополнительных точек
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

  const handleSelectPoint = useCallback(
    (
      point: PointWithoutTimestamps | null,
      selectorType: 'departure' | 'arrival' | 'additional',
      index?: number,
    ) => {
      if (point && isPointAlreadySelected(point, selectorType, index)) {
        showToast.error('Этот город уже выбран в другом селекторе');
        return;
      }

      if (selectorType === 'departure') {
        onSelectDeparture(point);
        setFormValue('departurePoint', point);
      } else if (selectorType === 'arrival') {
        onSelectArrival(point);
        setFormValue('arrivalPoint', point);
      } else if (selectorType === 'additional') {
        if (point) {
          const firstEmptyIndex = additionalPoints.findIndex((p) => p === null);

          if (firstEmptyIndex !== -1) {
            onSelectAdditional(point, firstEmptyIndex);
            const updatedPoints = [...additionalPoints];
            updatedPoints[firstEmptyIndex] = point;
            setFormValue('intermediatePoints', updatedPoints);
          } else if (index !== undefined) {
            onSelectAdditional(point, index);
            const updatedPoints = [...additionalPoints];
            updatedPoints[index] = point;
            setFormValue('intermediatePoints', updatedPoints);
          }
        } else if (index !== undefined) {
          onSelectAdditional(null, index);
          const updatedPoints = [...additionalPoints];
          updatedPoints[index] = null;
          setFormValue('intermediatePoints', updatedPoints);
        }
      }
    },
    [
      isPointAlreadySelected,
      onSelectDeparture,
      onSelectArrival,
      onSelectAdditional,
      setFormValue,
      additionalPoints,
    ],
  );

  const calculateRouteCost = useCallback(() => {
    if (!departurePoint || !arrivalPoint || routeDistance === 0) {
      setRouteCost(0);
      return;
    }

    const filteredAdditionalPoints = additionalPoints.filter(
      (p): p is PointWithoutTimestamps => p !== null,
    );
    const allPointsInRoute = [departurePoint, ...filteredAdditionalPoints, arrivalPoint];

    if (allPointsInRoute.length < 2) {
      setRouteCost(0);
      return;
    }

    const segmentCount = allPointsInRoute.length - 1;
    const avgDistancePerSegment = routeDistance / segmentCount;

    let totalCost = 0;

    for (let i = 0; i < segmentCount; i++) {
      // Используем точку ПРИБЫТИЯ для текущего сегмента (а не отправления)
      const toPoint = allPointsInRoute[i + 1];
      if (!toPoint) {
        console.warn(`Точка на индексе ${i + 1} не определена`);
        continue;
      }

      const segmentCost = Math.round(
        avgDistancePerSegment * Number(toPoint.pricePerKm) * Number(toPoint.terrainDifficulty || 1),
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
    handleSelectPoint,
  };
};
