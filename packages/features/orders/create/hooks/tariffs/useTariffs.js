import { useState, useCallback } from 'react';
import { fetchTariffs } from '@features/orders/create/api/orderApi';
export const useTariffs = ({ selectedServiceLevel, selectedVehicleType, setErrorMessage, }) => {
    const [tariffs, setTariffs] = useState([]);
    const updateTariffs = useCallback(async () => {
        try {
            const tariffsData = await fetchTariffs(selectedServiceLevel, selectedVehicleType ?? undefined);
            setTariffs(tariffsData);
            return tariffsData;
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error : new Error(String(error)), 'Error fetching tariffs');
            return [];
        }
    }, [setErrorMessage, selectedServiceLevel, selectedVehicleType]);
    return {
        tariffs,
        updateTariffs,
    };
};
