import { useState, useEffect } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { Point } from '@prisma/client';
import { SelectedAdditionalService } from '@features/orders/create/hooks';

interface UseOrderPriceCalculationProps {
  setValue: UseFormSetValue<CreateOrderData>;
  watch: UseFormWatch<CreateOrderData>;
  priceTariff: number | undefined;
  selectedAdditionalServices: SelectedAdditionalService[];
  selectedArrivalPoint: Point | null;
  selectedIntermediatePoints: Point[];
  extraWaitingTimeCost: number;
  additionalPointPrice: number | undefined;
}

export const useOrderPriceCalculation = ({
  priceTariff,
  selectedAdditionalServices,
  selectedArrivalPoint,
  selectedIntermediatePoints,
  extraWaitingTimeCost,
  additionalPointPrice,
  setValue,
}: UseOrderPriceCalculationProps) => {
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (!selectedArrivalPoint) {
      console.warn(
        'selectedArrivalPoint is null or undefined. Price calculation might be incorrect.',
      );
    }

    const additionalServicesPrice = selectedAdditionalServices.reduce(
      (acc, service) => acc + service.price,
      0,
    );

    const arrivalPointPrice = selectedArrivalPoint
      ? Number(selectedArrivalPoint.pricePerKm.toString())
      : 0;

    const intermediatePointsPrice = selectedIntermediatePoints.length * (additionalPointPrice ?? 0);

    const totalPrice =
      additionalServicesPrice +
      (priceTariff ?? 0) +
      arrivalPointPrice +
      intermediatePointsPrice +
      extraWaitingTimeCost;

    setPrice(totalPrice);
  }, [
    selectedAdditionalServices,
    selectedArrivalPoint,
    selectedIntermediatePoints,
    extraWaitingTimeCost,
    additionalPointPrice,
    priceTariff,
  ]);

  const handleUpdatePrice = () => {
    setValue('basePrice', price);
    console.log('Setting basePrice to:', price);
  };

  return {
    price,
    handleUpdatePrice,
  };
};
