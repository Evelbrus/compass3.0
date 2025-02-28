import { useMemo } from 'react';
import { Decimal } from 'decimal.js';

export interface UseTotalPriceParams {
  tariffPrice?: Decimal | number | null;
  additionalServicesPrice?: Decimal | number | null;
  waitTimeCost?: Decimal | number | null;
  routeCost?: Decimal | number | null;
}

const useTotalPrice = ({
  tariffPrice,
  additionalServicesPrice,
  waitTimeCost,
  routeCost,
}: UseTotalPriceParams): Decimal => {
  return useMemo(() => {
    const basePrice = tariffPrice ? new Decimal(tariffPrice) : new Decimal(0);
    const servicesPrice = additionalServicesPrice
      ? new Decimal(additionalServicesPrice)
      : new Decimal(0);
    const waitPrice = waitTimeCost ? new Decimal(waitTimeCost) : new Decimal(0);
    const routePrice = routeCost ? new Decimal(routeCost) : new Decimal(0);

    return basePrice.plus(servicesPrice).plus(waitPrice).plus(routePrice);
  }, [tariffPrice, additionalServicesPrice, waitTimeCost, routeCost]);
};

export default useTotalPrice;
