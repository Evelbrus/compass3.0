import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClients, fetchClientByUuid } from '@features/orders/create/api/orderApi';
export const useClients = ({ setErrorMessage, per_page = 4 }) => {
    const [clients, setClients] = useState(null);
    const [isClientsLoading, setIsClientsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const prevSearchRef = useRef(undefined);
    const fetchAllClients = useCallback(async (searchQuery = '', page = 1) => {
        try {
            setIsClientsLoading(true);
            if (prevSearchRef.current === searchQuery && page === 1)
                return;
            prevSearchRef.current = searchQuery;
            const response = await fetchClients(searchQuery, page.toString(), per_page.toString());
            setTotal(response.total);
            setClients((prev) => (page === 1 ? response.users : [...(prev || []), ...response.users]));
        }
        catch (error) {
            setErrorMessage(error, 'Error fetching clients');
            setClients(null);
        }
        finally {
            setIsClientsLoading(false);
        }
    }, [per_page, setErrorMessage]);
    const refetchClients = useCallback((searchQuery = '') => {
        setCurrentPage(1);
        fetchAllClients(searchQuery, 1);
    }, [fetchAllClients]);
    const fetchClientByUuidCallback = useCallback(async (uuid) => {
        try {
            const client = await fetchClientByUuid(uuid);
            return client;
        }
        catch (error) {
            setErrorMessage(error, 'Ошибка при получении клиента по UUID');
            return null;
        }
    }, [setErrorMessage]);
    const loadMore = useCallback(() => {
        const hasMore = clients ? clients.length < total : false;
        if (hasMore && !isClientsLoading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchAllClients(prevSearchRef.current || '', nextPage);
        }
    }, [isClientsLoading, currentPage, fetchAllClients, total, clients]);
    //Сброс currentPage при изменении searchQuery
    useEffect(() => {
        if (prevSearchRef.current !== undefined) {
            setCurrentPage(1);
        }
    }, [prevSearchRef.current]);
    return {
        clients,
        refetchClients,
        fetchClientByUuidCallback,
        total,
        loadMore,
        currentPage,
    };
};
