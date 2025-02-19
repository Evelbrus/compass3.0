import { useState, useCallback, useEffect } from 'react';
import { getDrivingDistance } from '@shared/components/modal/create-client-corp-order/api/someApiService';
const usePointSelectionHandlers = ({ departurePoint, arrivalPoint, additionalPoints, }) => {
    const [routeCost, setRouteCost] = useState(0);
    //Проверка, была ли уже выбрана точка в другом селекторе
    const isPointAlreadySelected = useCallback((point, type, index) => {
        if (type === 'departure')
            return (arrivalPoint?.uuid === point.uuid || additionalPoints.some((p) => p?.uuid === point.uuid));
        if (type === 'arrival')
            return (departurePoint?.uuid === point.uuid ||
                additionalPoints.some((p) => p?.uuid === point.uuid));
        if (type === 'additional' && typeof index === 'number') {
            return (departurePoint?.uuid === point.uuid ||
                arrivalPoint?.uuid === point.uuid ||
                additionalPoints.some((p, i) => i !== index && p?.uuid === point.uuid));
        }
        return false;
    }, [departurePoint, arrivalPoint, additionalPoints]);
    const calculateRouteCost = useCallback(async (from, to) => {
        if (!from || !to)
            return 0;
        try {
            //Логируем информацию о цене за километр и коэффициенте сложности для точки отправления
            console.log(`Цена за километр для точки отправления: ${from.pricePerKm}`);
            console.log(`Коэффициент сложности для точки отправления: ${from.terrainDifficulty}`);
            //Если необходимо использовать цену за километр с точки прибытия, раскомментируйте следующие строки:
            //console.log(`Цена за километр для точки прибытия: ${to.pricePerKm}`);
            //console.log(`Коэффициент сложности для точки прибытия: ${to.terrainDifficulty}`);
            const distance = await getDrivingDistance({ latitude: from.latitude, longitude: from.longitude }, { latitude: to.latitude, longitude: to.longitude });
            const cost = Math.round(distance * Number(from.pricePerKm) * Number(from.terrainDifficulty));
            console.log(`Расстояние: ${Math.round(distance)} км, Стоимость маршрута: ${cost}`);
            return cost;
        }
        catch (error) {
            console.error('Ошибка при расчете стоимости маршрута:', error);
            return 0;
        }
    }, []);
    //Расчет стоимости маршрута между departurePoint и arrivalPoint
    useEffect(() => {
        const updateRouteCost = async () => {
            if (departurePoint && arrivalPoint) {
                const cost = await calculateRouteCost(departurePoint, arrivalPoint);
                setRouteCost(cost);
                console.log('Обновленная стоимость маршрута от точки А до точки Б:', cost);
            }
            else {
                setRouteCost(0);
            }
        };
        updateRouteCost();
    }, [departurePoint, arrivalPoint, calculateRouteCost]);
    return {
        isPointAlreadySelected,
        calculateRouteCost,
        routeCost,
    };
};
export default usePointSelectionHandlers;
