import { useMemo } from 'react';
import { Decimal } from 'decimal.js';
const useTotalPrice = ({ tariffPrice, additionalServicesPrice, additionalPointsPrice, waitTimeCost, routeCost, }) => {
    return useMemo(() => {
        const basePrice = tariffPrice ? new Decimal(tariffPrice) : new Decimal(0);
        const servicesPrice = additionalServicesPrice
            ? new Decimal(additionalServicesPrice)
            : new Decimal(0);
        const pointsPrice = additionalPointsPrice ? new Decimal(additionalPointsPrice) : new Decimal(0);
        const waitPrice = waitTimeCost ? new Decimal(waitTimeCost) : new Decimal(0);
        const routePrice = routeCost ? new Decimal(routeCost) : new Decimal(0);
        return basePrice.plus(servicesPrice).plus(pointsPrice).plus(waitPrice).plus(routePrice);
    }, [tariffPrice, additionalServicesPrice, additionalPointsPrice, waitTimeCost, routeCost]);
};
export default useTotalPrice;
