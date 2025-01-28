import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { Point } from '@prisma/client';

interface CalculateTotalPriceParams {
  selectedTariff: ExtendedTariff | null;
  selectedAdditionalServices: string[];
  intermediatePoints?: string[];
  arrivalPointUuid?: string;
  points: Point[];
}

export const calculateTotalPrice = ({
  selectedTariff,
  selectedAdditionalServices,
  intermediatePoints = [],
  arrivalPointUuid,
  points,
}: CalculateTotalPriceParams): number => {
  if (!selectedTariff) return 0;

  let total = selectedTariff.price;

  total += selectedTariff.tariffAdditionalServices
    .filter((service) => selectedAdditionalServices.includes(service.uuid))
    .reduce((acc, service) => acc + service.price, 0);

  total += intermediatePoints.length * selectedTariff.additionalPointPrice;

  if (arrivalPointUuid) {
    const arrivalPoint = points.find((point) => point.uuid === arrivalPointUuid);
    if (arrivalPoint && arrivalPoint.basePrice) {
      if (typeof arrivalPoint.basePrice === 'object' && arrivalPoint.basePrice.toNumber) {
        total += arrivalPoint.basePrice.toNumber();
      } else if (typeof arrivalPoint.basePrice === 'number') {
        total += arrivalPoint.basePrice;
      } else if (typeof arrivalPoint.basePrice === 'string') {
        total += parseFloat(arrivalPoint.basePrice);
      }
    }
  }

  return total;
};
