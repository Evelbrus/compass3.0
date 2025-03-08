import { useState, useEffect } from 'react';
import { Decimal } from 'decimal.js';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';
import { Tariff } from '@prisma/client';

interface UseWaitTimeProps {
  selectedTariff?: Tariff | null;
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

export const useWaitTime = ({
  selectedTariff,
  departurePoint,
  initialWaitTime = 0,
}: UseWaitTimeProps): UseWaitTimeReturn => {
  const [waitTime, setWaitTime] = useState<number>(initialWaitTime);
  const [minWaitTime, setMinWaitTime] = useState<number>(0);
  const [maxWaitTime, _setMaxWaitTime] = useState<number>(60);
  const [additionalWaitTimeCost, setAdditionalWaitTimeCost] = useState<number>(0);

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

    if (initialWaitTime === 0 && waitTime === 0) {
      setWaitTime(freeWaitTime);
    }
  }, [selectedTariff, departurePoint, initialWaitTime, waitTime]);

  useEffect(() => {
    if (!selectedTariff) {
      setAdditionalWaitTimeCost(0);
      return;
    }

    const isAirport = departurePoint?.airport ?? false;
    const freeWaitTime = isAirport
      ? selectedTariff.freeWaitTimeAirport
      : selectedTariff.freeWaitTimeBishkek;

    const pricePerMinute = isAirport
      ? selectedTariff.pricePerMinuteAfterAirport
      : selectedTariff.pricePerMinuteAfterBishkek;

    const additionalMinutes = Math.max(0, waitTime - freeWaitTime);

    if (pricePerMinute !== undefined && pricePerMinute !== null) {
      setAdditionalWaitTimeCost(Number(new Decimal(additionalMinutes).mul(pricePerMinute)));
    } else {
      setAdditionalWaitTimeCost(0);
    }
  }, [waitTime, selectedTariff, departurePoint]);

  const adjustWaitTime = (increment: number) => {
    const newWaitTime = Math.max(minWaitTime, Math.min(maxWaitTime, waitTime + increment));
    setWaitTime(newWaitTime);
  };

  return { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime };
};
