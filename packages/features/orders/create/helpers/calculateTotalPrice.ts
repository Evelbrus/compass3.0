import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { Point } from '@prisma/client';

interface CalculateTotalPriceParams {
  selectedTariff?: ExtendedTariff | null;
  selectedAdditionalServices?: string[];
  intermediatePoints?: string[];
  arrivalPointUuid?: string;
  departurePointUuid?: string;
  points?: Point[];
  waitingTimeMinutes?: number;
}

export const calculateTotalPrice = ({
  selectedTariff,
  selectedAdditionalServices = [],
  intermediatePoints = [],
  arrivalPointUuid,
  departurePointUuid,
  points = [],
  waitingTimeMinutes = 0,
}: CalculateTotalPriceParams): number => {
  if (!selectedTariff) {
    return 0;
  }

  let total = selectedTariff.price;

  total += selectedTariff.tariffAdditionalServices
    .filter((service) => selectedAdditionalServices.includes(service.uuid))
    .reduce((acc, service) => acc + service.price, 0);

  total += intermediatePoints.length * selectedTariff.additionalPointPrice;

  if (arrivalPointUuid) {
    const arrivalPoint = points.find((point) => point.uuid === arrivalPointUuid);
    if (arrivalPoint && arrivalPoint.basePrice) {
      let arrivalPointBasePrice = 0;
      if (typeof arrivalPoint.basePrice === 'object' && arrivalPoint.basePrice.toNumber) {
        arrivalPointBasePrice = arrivalPoint.basePrice.toNumber();
      } else if (typeof arrivalPoint.basePrice === 'number') {
        arrivalPointBasePrice = arrivalPoint.basePrice;
      } else if (typeof arrivalPoint.basePrice === 'string') {
        arrivalPointBasePrice = parseFloat(arrivalPoint.basePrice);
      }
      total += arrivalPointBasePrice;
    }
  }

  //Расчет стоимости ожидания
  if (selectedTariff && departurePointUuid) {
    const departurePoint = points.find((point) => point.uuid === departurePointUuid);
    if (departurePoint) {
      const freeWaitTime = departurePoint.airport
        ? selectedTariff.freeWaitTimeAirport
        : selectedTariff.freeWaitTimeBishkek;
      const pricePerMinute = departurePoint.airport
        ? selectedTariff.pricePerMinuteAfterAirport
        : selectedTariff.pricePerMinuteAfterBishkek;

      if (waitingTimeMinutes > freeWaitTime) {
        total += (waitingTimeMinutes - freeWaitTime) * pricePerMinute;
      }
    }
  }
  return total;
};
