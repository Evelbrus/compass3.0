import { useState, useEffect } from 'react';
import { Point } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { TariffWithServices } from '@pages/(administrator)/orders/create/OrderCreate.view';

// Определяем тип PointWithoutTimestamps, как в других хуках
type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

interface UseWaitTimeProps {
  selectedTariff?: TariffWithServices | null;
  departurePoint?: PointWithoutTimestamps | null;
  initialWaitTime?: number;
}

interface UseWaitTimeReturn {
  waitTime: number;
  additionalWaitTimeCost: number;
  adjustWaitTime: (increment: number) => void;
  minWaitTime: number;
  maxWaitTime: number;
}

const useWaitTime = ({
  selectedTariff,
  departurePoint,
  initialWaitTime = 0,
}: UseWaitTimeProps): UseWaitTimeReturn => {
  const [waitTime, setWaitTime] = useState<number>(initialWaitTime);
  const [minWaitTime, setMinWaitTime] = useState<number>(0);
  const [maxWaitTime, setMaxWaitTime] = useState<number>(60);
  const [additionalWaitTimeCost, setAdditionalWaitTimeCost] = useState<number>(0);

  // Эффект для инициализации времени ожидания при изменении тарифа или точки отправления
  useEffect(() => {
    if (!selectedTariff) {
      setMinWaitTime(0);
      return;
    }

    const isAirport = departurePoint?.airport ?? false;
    const freeWaitTime = isAirport
      ? selectedTariff.freeWaitTimeAirport
      : selectedTariff.freeWaitTimeBishkek;

    setMinWaitTime(freeWaitTime);

    // Устанавливаем время ожидания только если это первоначальная инициализация
    if (initialWaitTime === 0 && waitTime === 0) {
      setWaitTime(freeWaitTime);
    }
  }, [selectedTariff, departurePoint, initialWaitTime, waitTime]);

  // Отдельный эффект для пересчета стоимости дополнительного ожидания
  useEffect(() => {
    // Проверяем наличие всех необходимых данных для расчета
    if (!selectedTariff) {
      setAdditionalWaitTimeCost(0);
      return;
    }

    // Важно: даже без выбранной точки отправления, мы можем рассчитать примерную стоимость
    // Это решает проблему с отображением нуля в режиме создания
    const isAirport = departurePoint?.airport ?? false;
    const freeWaitTime = isAirport
      ? selectedTariff.freeWaitTimeAirport
      : selectedTariff.freeWaitTimeBishkek;

    const pricePerMinute = isAirport
      ? selectedTariff.pricePerMinuteAfterAirport
      : selectedTariff.pricePerMinuteAfterBishkek;

    // Рассчитываем дополнительные минуты и стоимость
    const additionalMinutes = Math.max(0, waitTime - freeWaitTime);

    // Проверяем, что pricePerMinute существует и не равен undefined или null
    if (pricePerMinute !== undefined && pricePerMinute !== null) {
      setAdditionalWaitTimeCost(Number(new Decimal(additionalMinutes).mul(pricePerMinute)));
    } else {
      setAdditionalWaitTimeCost(0);
    }

    // Добавляем логи для отладки
    console.log('Расчет стоимости ожидания:', {
      waitTime,
      freeWaitTime,
      additionalMinutes,
      pricePerMinute,
      cost:
        additionalMinutes > 0 ? Number(new Decimal(additionalMinutes).mul(pricePerMinute || 0)) : 0,
    });
  }, [waitTime, selectedTariff, departurePoint]);

  // Функция для изменения времени ожидания
  const adjustWaitTime = (increment: number) => {
    // Позволяем изменять время ожидания даже если тариф не выбран
    const newWaitTime = Math.max(minWaitTime, Math.min(maxWaitTime, waitTime + increment));
    setWaitTime(newWaitTime);
  };

  return { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime };
};

export default useWaitTime;
