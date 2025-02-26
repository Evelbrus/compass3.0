import { useState, useCallback, useEffect } from 'react';
import { showToast } from '@shared/components/toast/ToastManager';
import { PointWithoutTimestamps } from '@features/orders/create/hooks/points/useAllPoints';

// Интерфейс параметров хука
interface PointSelectionHandlersProps {
  departurePoint?: PointWithoutTimestamps | null; // Точка отправления
  arrivalPoint?: PointWithoutTimestamps | null; // Точка прибытия
  additionalPoints: (PointWithoutTimestamps | null)[]; // Массив дополнительных точек
  routeDistance: number; // Общая дистанция маршрута
  onSelectDeparture: (point: PointWithoutTimestamps | null) => void; // Обновление точки отправления
  onSelectArrival: (point: PointWithoutTimestamps | null) => void; // Обновление точки прибытия
  onSelectAdditional: (point: PointWithoutTimestamps | null, index: number) => void; // Обновление доп. точки
  setFormValue: (name: string, value: any) => void; // Функция для обновления формы (например, из react-hook-form)
}

// Хук usePointSelectionHandlers
const usePointSelectionHandlers = ({
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

  // Проверка, выбрана ли точка в другом селекторе
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

  // Обобщённый обработчик выбора точек
  const handleSelectPoint = useCallback(
    (
      point: PointWithoutTimestamps | null,
      selectorType: 'departure' | 'arrival' | 'additional',
      index?: number,
    ) => {
      // Проверка на дубликаты
      if (point && isPointAlreadySelected(point, selectorType, index)) {
        showToast.error('Этот город уже выбран в другом селекторе');
        return;
      }

      // Обработка выбора в зависимости от типа селектора
      if (selectorType === 'departure') {
        onSelectDeparture(point);
        setFormValue('departurePoint', point || ({} as PointWithoutTimestamps));
      } else if (selectorType === 'arrival') {
        onSelectArrival(point);
        setFormValue('arrivalPoint', point || ({} as PointWithoutTimestamps));
      } else if (selectorType === 'additional' && index !== undefined) {
        onSelectAdditional(point, index);
        const currentPoints = additionalPoints || Array(5).fill(null);
        const updatedPoints = [...currentPoints];
        updatedPoints[index] = point ? { uuid: point.uuid } : null;
        setFormValue('intermediatePoints', updatedPoints);
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

  // Расчёт стоимости маршрута
  const calculateRouteCost = useCallback(() => {
    if (!departurePoint || !arrivalPoint || routeDistance === 0) {
      setRouteCost(0);
      return;
    }

    // Фильтрация дополнительных точек (удаляем null)
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

  // Пересчёт стоимости при изменении точек или дистанции
  useEffect(() => {
    calculateRouteCost();
  }, [calculateRouteCost]);

  // Возвращаемые значения хука
  return {
    isPointAlreadySelected, // Функция проверки дубликатов
    routeCost, // Стоимость маршрута
    handleSelectPoint, // Обработчик выбора точек
  };
};

export default usePointSelectionHandlers;
