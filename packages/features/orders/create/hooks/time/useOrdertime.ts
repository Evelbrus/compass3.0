import { useCallback, useEffect, useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { Point } from '@prisma/client';

interface UseOrderTimeProps {
  setValue: UseFormSetValue<CreateOrderData>;
  watch: UseFormWatch<CreateOrderData>;
  selectedTariff: ExtendedTariff | null;
  selectedDeparturePoint: Point | null;
}

export const useOrderTime = ({
  watch,
  setValue,
  selectedTariff,
  selectedDeparturePoint,
}: UseOrderTimeProps) => {
  //Вычисляем freeWaitTime на основе selectedDeparturePoint и selectedTariff
  const freeWaitTime = selectedDeparturePoint?.airport
    ? selectedTariff?.freeWaitTimeAirport
    : selectedTariff?.freeWaitTimeBishkek;

  const pricePerMinute = selectedDeparturePoint?.airport
    ? selectedTariff?.pricePerMinuteAfterAirport
    : selectedTariff?.pricePerMinuteAfterBishkek;

  const [waitingTimeMinutes, setWaitingTimeMinutes] = useState<number>(freeWaitTime ?? 0);

  //Добавляем watch на waitingTimeMinutes
  const watchedWaitingTimeMinutes = watch('waitingTimeMinutes');

  useEffect(() => {
    //Инициализируем waitingTimeMinutes значением из формы или freeWaitTime
    setWaitingTimeMinutes(watchedWaitingTimeMinutes ?? freeWaitTime ?? 0);
  }, [watchedWaitingTimeMinutes, freeWaitTime]);

  //Сбрасываем waitingTimeMinutes на freeWaitTime, если selectedDeparturePoint меняется
  useEffect(() => {
    setWaitingTimeMinutes(freeWaitTime ?? 0);
  }, [selectedDeparturePoint, freeWaitTime]);

  const handleWaitingTimeChange = useCallback(
    (newTime: number) => {
      setWaitingTimeMinutes(newTime);
      setValue('waitingTimeMinutes', newTime);
    },
    [setValue],
  );

  //Вычисляем стоимость ожидания после бесплатного времени
  const extraWaitingTimeCost = (() => {
    const waitingTimeOverFree = (waitingTimeMinutes ?? 0) - (freeWaitTime ?? 0);

    if (waitingTimeOverFree <= 0) {
      return 0;
    }

    const numberOf5MinuteIntervals = Math.ceil(waitingTimeOverFree / 5);
    return numberOf5MinuteIntervals * (pricePerMinute ?? 0);
  })();

  return {
    freeWaitTime,
    waitingTimeMinutes,
    handleWaitingTimeChange,
    extraWaitingTimeCost,
  };
};
