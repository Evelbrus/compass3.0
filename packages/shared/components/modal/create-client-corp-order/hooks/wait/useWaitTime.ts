import { useState, useEffect } from 'react';
import { Point } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { TariffWithServices } from '@shared/components/modal/create-client-corp-order/CreateClientCorpOrder';

interface UseWaitTimeProps {
  selectedTariff?: TariffWithServices | null;
  departurePoint?: Point | null;
}

interface UseWaitTimeReturn {
  waitTime: number;
  additionalWaitTimeCost: number;
  adjustWaitTime: (increment: number) => void;
  minWaitTime: number;
  maxWaitTime: number;
}

const useWaitTime = ({ selectedTariff, departurePoint }: UseWaitTimeProps): UseWaitTimeReturn => {
  const [waitTime, setWaitTime] = useState<number>(0);
  const [minWaitTime, setMinWaitTime] = useState<number>(0);
  const [maxWaitTime, setMaxWaitTime] = useState<number>(60);
  const [additionalWaitTimeCost, setAdditionalWaitTimeCost] = useState<number>(0);

  useEffect(() => {
    if (selectedTariff) {
      const isAirport = departurePoint?.airport ?? false;
      const freeWaitTime = isAirport
        ? selectedTariff.freeWaitTimeAirport
        : selectedTariff.freeWaitTimeBishkek;
      const pricePerMinute = isAirport
        ? selectedTariff.pricePerMinuteAfterAirport
        : selectedTariff.pricePerMinuteAfterBishkek;

      setMinWaitTime(freeWaitTime);
      setWaitTime(departurePoint ? freeWaitTime : 0);
      setMaxWaitTime(60);

      const additionalMinutes = Math.max(0, freeWaitTime - freeWaitTime);
      setAdditionalWaitTimeCost(Number(new Decimal(additionalMinutes).mul(pricePerMinute)));
    }
  }, [selectedTariff, departurePoint]);

  useEffect(() => {
    if (selectedTariff) {
      const isAirport = departurePoint?.airport ?? false;
      const freeWaitTime = isAirport
        ? selectedTariff.freeWaitTimeAirport
        : selectedTariff.freeWaitTimeBishkek;
      const pricePerMinute = isAirport
        ? selectedTariff.pricePerMinuteAfterAirport
        : selectedTariff.pricePerMinuteAfterBishkek;

      const additionalMinutes = Math.max(0, waitTime - freeWaitTime);
      setAdditionalWaitTimeCost(
        departurePoint ? Number(new Decimal(additionalMinutes).mul(pricePerMinute)) : 0,
      );
    }
  }, [waitTime, selectedTariff, departurePoint]);

  const adjustWaitTime = (increment: number) => {
    if (!selectedTariff || !departurePoint) return;
    const newWaitTime = Math.max(minWaitTime, Math.min(maxWaitTime, waitTime + increment));
    setWaitTime(newWaitTime);
  };

  return { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime };
};

export default useWaitTime;
