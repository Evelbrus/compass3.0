import { useMemo } from 'react';
import { Decimal } from 'decimal.js';

export interface UseTotalPriceParams {
  tariffPrice?: Decimal | number | null;
  additionalServicesPrice?: Decimal | number | null;
  additionalPointsPrice?: Decimal | number | null;
  arrivalPrice?: Decimal | number | null;
  waitTimeCost?: Decimal | number | null;
}

const useTotalPrice = ({
  tariffPrice,
  additionalServicesPrice,
  additionalPointsPrice,
  arrivalPrice,
  waitTimeCost,
}: UseTotalPriceParams): Decimal => {
  return useMemo(() => {
    const basePrice = tariffPrice ? new Decimal(tariffPrice) : new Decimal(0);
    const servicesPrice = additionalServicesPrice
      ? new Decimal(additionalServicesPrice)
      : new Decimal(0);
    const pointsPrice = additionalPointsPrice ? new Decimal(additionalPointsPrice) : new Decimal(0);
    const arrPrice = arrivalPrice ? new Decimal(arrivalPrice) : new Decimal(0);
    const waitPrice = waitTimeCost ? new Decimal(waitTimeCost) : new Decimal(0);

    return basePrice.plus(servicesPrice).plus(pointsPrice).plus(arrPrice).plus(waitPrice);
  }, [tariffPrice, additionalServicesPrice, additionalPointsPrice, arrivalPrice, waitTimeCost]);
};

export default useTotalPrice;
