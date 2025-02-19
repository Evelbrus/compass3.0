import { useState, useEffect, useCallback } from 'react';
import { fetchAdditionalServices } from '@features/orders/create/api/orderApi';
export const useAdditionalServices = ({ setErrorMessage }) => {
    const [additionalServices, setAdditionalServices] = useState([]);
    const fetchAllAdditionalServices = useCallback(async () => {
        try {
            const servicesData = await fetchAdditionalServices();
            setAdditionalServices(servicesData);
        }
        catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            setErrorMessage(normalizedError, 'Error fetching additional services');
        }
    }, [setErrorMessage]);
    useEffect(() => {
        fetchAllAdditionalServices();
    }, [fetchAllAdditionalServices]);
    return { additionalServices };
};
