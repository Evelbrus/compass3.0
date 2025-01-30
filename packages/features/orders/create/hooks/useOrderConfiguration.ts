import { useState, useCallback, useEffect } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import {
  calculateTotalPrice,
  handleAdditionalServiceChange,
} from '@features/orders/create/helpers';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { Point, ServiceLevels, VehicleType } from '@prisma/client';
import { useTariffs } from '@features/orders/create/hooks';

interface UseOrderCreateHandlersProps {
  setValue: UseFormSetValue<CreateOrderData>;
  watch: UseFormWatch<CreateOrderData>;
  points: Point[];
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useOrderConfiguration = ({
  setValue,
  watch,
  points,
  setErrorMessage,
}: UseOrderCreateHandlersProps) => {
  const vehicleTypes = Object.values(VehicleType);
  const serviceLevels = Object.values(ServiceLevels);

  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('Sedan');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('');
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [allTariffs, setAllTariffs] = useState<ExtendedTariff[]>([]);
  const [waitingTimeMinutes, setWaitingTimeMinutes] = useState<number>(0);
  const [waitingInfo, setWaitingInfo] = useState<{
    freeWaitTime: number;
    pricePerMinute: number;
    isAirport: boolean;
  } | null>(null);
  const [isLoadingTariff, setIsLoadingTariff] = useState<boolean>(true);

  const { updateTariffs: fetchTariffs } = useTariffs({
    selectedServiceLevel: '',
    selectedVehicleType: selectedVehicleType,
    setErrorMessage,
  });

  const handleVehicleTypeChange = useCallback((value: string) => {
    setSelectedVehicleType(value);
    setSelectedServiceLevel('');
  }, []);

  const handleServiceLevelChange = useCallback((value: string) => {
    setSelectedServiceLevel(value);
  }, []);

  useEffect(() => {
    setIsLoadingTariff(true);
    fetchTariffs().then((data) => {
      setAllTariffs(data);
      setIsLoadingTariff(false);
    });
  }, [fetchTariffs]);

  useEffect(() => {
    if (selectedVehicleType) {
      const filteredTariffs = allTariffs.filter(
        (tariff) => tariff.vehicleType === selectedVehicleType,
      );
      if (filteredTariffs.length > 0) {
        const defaultTariff =
          filteredTariffs.find((t) => t.serviceLevel === selectedServiceLevel) ||
          filteredTariffs[0];
        setSelectedTariff(defaultTariff);
        setValue('tariffUuid', defaultTariff.uuid);
        let freeWaitTime = 5;
        let pricePerMinute = 0;
        let isAirport = false;
        if (watch().departurePoint) {
          const departurePoint = points.find((point) => point.uuid === watch().departurePoint);
          if (departurePoint?.airport) {
            freeWaitTime = defaultTariff.freeWaitTimeAirport;
            pricePerMinute = defaultTariff.pricePerMinuteAfterAirport;
            isAirport = true;
          } else {
            freeWaitTime = defaultTariff.freeWaitTimeBishkek;
            pricePerMinute = defaultTariff.pricePerMinuteAfterBishkek;
            isAirport = false;
          }
        }
        setWaitingTimeMinutes(freeWaitTime);
        setWaitingInfo({ freeWaitTime, pricePerMinute, isAirport });
        const newPrice = calculateTotalPrice({
          selectedTariff: defaultTariff,
          selectedAdditionalServices,
          intermediatePoints: watch().intermediatePoints || [],
          arrivalPointUuid: watch().arrivalPoint,
          points,
          waitingTimeMinutes,
        });
        setValue('basePrice', newPrice);
      } else {
        setSelectedTariff(null);
        setValue('tariffUuid', '');
        setValue('basePrice', 0);
        setWaitingTimeMinutes(0);
        setWaitingInfo(null);
      }
    }
  }, [
    selectedVehicleType,
    allTariffs,
    setValue,
    watch,
    points,
    selectedAdditionalServices,
    waitingTimeMinutes,
    selectedServiceLevel,
  ]);

  useEffect(() => {
    if (selectedTariff) {
      const newPrice = calculateTotalPrice({
        selectedTariff,
        selectedAdditionalServices,
        intermediatePoints: watch().intermediatePoints || [],
        arrivalPointUuid: watch().arrivalPoint,
        points,
        waitingTimeMinutes,
      });
      setValue('basePrice', newPrice);
    }
  }, [
    watch().arrivalPoint,
    watch().intermediatePoints,
    selectedTariff,
    selectedAdditionalServices,
    points,
    setValue,
    watch,
    waitingTimeMinutes,
  ]);

  const handleAdditionalServiceChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      const newServices = handleAdditionalServiceChange(
        e.target.checked,
        serviceUuid,
        selectedAdditionalServices,
      );
      setSelectedAdditionalServices(newServices);
      if (selectedTariff) {
        const newPrice = calculateTotalPrice({
          selectedTariff,
          selectedAdditionalServices: newServices,
          intermediatePoints: watch().intermediatePoints || [],
          arrivalPointUuid: watch().arrivalPoint,
          points,
          waitingTimeMinutes,
        });
        setValue('basePrice', newPrice);
      }
    },
    [selectedAdditionalServices, setValue, selectedTariff, watch, points, waitingTimeMinutes],
  );

  const handleWaitingTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newWaitingTime = parseInt(e.target.value, 10) || 0;
      setWaitingTimeMinutes(newWaitingTime);
      if (selectedTariff) {
        const newPrice = calculateTotalPrice({
          selectedTariff,
          selectedAdditionalServices,
          intermediatePoints: watch().intermediatePoints || [],
          arrivalPointUuid: watch().arrivalPoint,
          points,
          waitingTimeMinutes: newWaitingTime,
        });
        setValue('basePrice', newPrice);
      }
    },
    [selectedTariff, selectedAdditionalServices, points, setValue, watch, waitingTimeMinutes],
  );

  useEffect(() => {
    if (selectedTariff) {
      let freeWaitTime = 5;
      let pricePerMinute = 0;
      let isAirport = false;
      if (watch().departurePoint) {
        const departurePoint = points.find((point) => point.uuid === watch().departurePoint);
        if (departurePoint?.airport) {
          freeWaitTime = selectedTariff.freeWaitTimeAirport;
          pricePerMinute = selectedTariff.pricePerMinuteAfterAirport;
          isAirport = true;
        } else {
          freeWaitTime = selectedTariff.freeWaitTimeBishkek;
          pricePerMinute = selectedTariff.pricePerMinuteAfterBishkek;
          isAirport = false;
        }
      }
      setWaitingTimeMinutes(freeWaitTime);
      setWaitingInfo({ freeWaitTime, pricePerMinute, isAirport });
    }
  }, [watch().departurePoint, selectedTariff, points]);

  return {
    vehicleTypes,
    serviceLevels,
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleAdditionalServiceChangeCallback,
    tariffs: allTariffs,
    handleWaitingTimeChange,
    waitingTimeMinutes,
    waitingInfo,
    isLoadingTariff,
  };
};
