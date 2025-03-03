import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClientByUuid, fetchClients } from '@features/orders/create/api/orders.api';
import { Client } from '@features/orders/create/types/types';

interface UseClientsProps {
  per_page?: number;
  disabled?: boolean;
}

export const useClients = ({ per_page = 4, disabled = false }: UseClientsProps) => {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [isClientsLoading, setIsClientsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const prevSearchRef = useRef<string | undefined>(undefined);

  const fetchAllClients = useCallback(
    async (searchQuery: string = '', page: number = 1) => {
      if (disabled) return;

      try {
        setIsClientsLoading(true);

        if (prevSearchRef.current === searchQuery && page === currentPage) return;
        prevSearchRef.current = searchQuery;

        const response = await fetchClients(searchQuery, page.toString(), per_page.toString());

        setTotal(response.total);

        if (page === 1) {
          setClients(response.users || []);
        } else {
          setClients((prev) => {
            if (!prev) return response.users || [];
            if (!response.users) return prev;
            return [...prev, ...response.users];
          });
        }
      } catch (error) {
        setClients(null);
      } finally {
        setIsClientsLoading(false);
      }
    },
    [per_page, currentPage, disabled],
  );

  const refetchClients = useCallback(
    (searchQuery: string = '') => {
      if (disabled) return;

      setCurrentPage(1);
      fetchAllClients(searchQuery, 1);
    },
    [fetchAllClients, disabled],
  );

  const fetchClientByUuidCallback = useCallback(async (uuid: string): Promise<Client | null> => {
    try {
      return await fetchClientByUuid(uuid);
    } catch (error) {
      return null;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (disabled) return;

    const hasMore = clients !== null && clients.length < total;
    if (hasMore && !isClientsLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAllClients(prevSearchRef.current || '', nextPage);
    }
  }, [isClientsLoading, currentPage, fetchAllClients, total, clients, disabled]);

  useEffect(() => {
    if (disabled) return;

    const search = prevSearchRef.current;
    if (search !== undefined) {
      setCurrentPage(1);
    }
  }, [disabled]);

  return {
    clients,
    isClientsLoading,
    refetchClients,
    fetchClientByUuidCallback,
    total,
    loadMore,
    currentPage,
  };
};
