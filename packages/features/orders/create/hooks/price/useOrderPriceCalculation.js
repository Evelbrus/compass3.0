import { useState, useEffect } from 'react';
export const useOrderPriceCalculation = ({ priceTariff, selectedAdditionalServices, selectedArrivalPoint, selectedIntermediatePoints, extraWaitingTimeCost, additionalPointPrice, setValue, }) => {
    const [price, setPrice] = useState(0);
    useEffect(() => {
        if (!selectedArrivalPoint) {
            console.warn('selectedArrivalPoint is null or undefined. Price calculation might be incorrect.');
        }
        const additionalServicesPrice = selectedAdditionalServices.reduce((acc, service) => acc + service.price, 0);
        const arrivalPointPrice = selectedArrivalPoint
            ? Number(selectedArrivalPoint.pricePerKm.toString())
            : 0;
        const intermediatePointsPrice = selectedIntermediatePoints.length * (additionalPointPrice ?? 0);
        const totalPrice = additionalServicesPrice +
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
