import { useCallback } from 'react';
import { Decimal } from 'decimal.js';
const usePointSelectionHandlers = ({ departurePoint, arrivalPoint, additionalPoints, onFromSelectPoint, onToSelectPoint, onAdditionalSelectPoint, }) => {
    //Функция для проверки, выбрана ли точка в каком-либо из селекторов
    const isPointAlreadySelected = useCallback((point, currentField, additionalIndex) => {
        //Если точка уже выбрана в текущем селекторе – пропускаем проверку
        if (currentField === 'departure' && departurePoint?.uuid === point.uuid)
            return false;
        if (currentField === 'arrival' && arrivalPoint?.uuid === point.uuid)
            return false;
        if (currentField === 'additional' &&
            typeof additionalIndex === 'number' &&
            additionalPoints &&
            additionalPoints[additionalIndex]?.uuid === point.uuid)
            return false;
        //Проверяем, выбрана ли точка в других селекторах
        if (currentField !== 'departure' && departurePoint?.uuid === point.uuid)
            return true;
        if (currentField !== 'arrival' && arrivalPoint?.uuid === point.uuid)
            return true;
        if (currentField === 'additional') {
            if (additionalPoints &&
                additionalPoints.some((p, idx) => idx !== additionalIndex && p?.uuid === point.uuid)) {
                return true;
            }
        }
        else {
            if (additionalPoints?.some((p) => p?.uuid === point.uuid))
                return true;
        }
        return false;
    }, [departurePoint, arrivalPoint, additionalPoints]);
    const handleDepartureSelectPoint = useCallback((point) => {
        if (isPointAlreadySelected(point, 'departure')) {
            alert('Этот город уже выбран в другом селекторе');
            return;
        }
        //Преобразуем basePrice в Decimal
        onFromSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) });
    }, [isPointAlreadySelected, onFromSelectPoint]);
    const handleArrivalSelectPoint = useCallback((point) => {
        if (isPointAlreadySelected(point, 'arrival')) {
            alert('Этот город уже выбран в другом селекторе');
            return;
        }
        onToSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) });
    }, [isPointAlreadySelected, onToSelectPoint]);
    const handleAdditionalSelectPoint = useCallback((point, index) => {
        if (isPointAlreadySelected(point, 'additional', index)) {
            alert('Этот город уже выбран в другом селекторе');
            return;
        }
        onAdditionalSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) }, index);
    }, [isPointAlreadySelected, onAdditionalSelectPoint]);
    return {
        handleDepartureSelectPoint,
        handleArrivalSelectPoint,
        handleAdditionalSelectPoint,
    };
};
export default usePointSelectionHandlers;
