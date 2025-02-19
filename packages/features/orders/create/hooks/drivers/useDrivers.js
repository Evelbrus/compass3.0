import { useState, useCallback, useEffect } from 'react';
import { fetchDrivers, fetchAssignedDriver } from '@features/orders/create/api/orderApi';
export const useDrivers = ({ vehicleType, serviceLevel, setErrorMessage }) => {
    const [drivers, setDrivers] = useState(null);
    const [assignedDriver, setAssignedDriver] = useState(null);
    const [page, setPage] = useState('1');
    const [perPage, setPerPage] = useState('2');
    const [total, setTotal] = useState(0);
    const [isDriversLoading, setIsLoading] = useState(false);
    const [serverTime, setServerTime] = useState(null);
    const fetchDriversData = useCallback(async (vehicleTypeQuery, serviceLevelQuery, searchQuery = '') => {
        setIsLoading(true);
        try {
            const driversData = await fetchDrivers(serviceLevelQuery, vehicleTypeQuery, searchQuery, page, perPage);
            setDrivers(driversData.drivers);
            setTotal(driversData.total);
            setServerTime(driversData.serverTime);
        }
        catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            setErrorMessage(normalizedError, 'Error fetching drivers');
            setDrivers(null);
            setTotal(0);
        }
        setIsLoading(false);
    }, [setErrorMessage, page, perPage]);
    const refetchDrivers = useCallback((searchQuery = '', vehicleTypeQuery, serviceLevelQuery) => {
        fetchDriversData(searchQuery ? undefined : vehicleTypeQuery, searchQuery ? null : (serviceLevelQuery ?? null), searchQuery);
    }, [fetchDriversData]);
    useEffect(() => {
        fetchDriversData(vehicleType, serviceLevel ?? null, '');
    }, [fetchDriversData, vehicleType, serviceLevel]);
    const fetchAssignedDriverData = useCallback(async (assignedDriverId) => {
        setIsLoading(true);
        try {
            const driverData = await fetchAssignedDriver(assignedDriverId);
            setAssignedDriver(driverData);
        }
        catch (error) {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            setErrorMessage(normalizedError, 'Error fetching assigned driver');
            setAssignedDriver(null);
        }
        setIsLoading(false);
    }, [setErrorMessage]);
    return {
        drivers,
        assignedDriver,
        isDriversLoading,
        refetchDrivers,
        fetchAssignedDriverData,
        page,
        perPage,
        setPage,
        setPerPage,
        total,
        serverTime,
    };
};
