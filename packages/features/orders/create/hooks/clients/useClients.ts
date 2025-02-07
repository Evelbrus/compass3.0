import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClients, fetchClientByUuid } from '@features/orders/create/api/orderApi';
import { User } from '@prisma/client';

interface UseClientsProps {
  per_page?: number;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useClients = ({ setErrorMessage, per_page = 4 }: UseClientsProps) => {
  const [clients, setClients] = useState<User[] | null>(null);
  const [isClientsLoading, setIsClientsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const prevSearchRef = useRef<string | undefined>(undefined);

  const fetchAllClients = useCallback(
    async (searchQuery: string = '', page: number = 1) => {
      try {
        setIsClientsLoading(true);

        if (prevSearchRef.current === searchQuery && page === 1) return;
        prevSearchRef.current = searchQuery;

        const response = await fetchClients(searchQuery, page.toString(), per_page.toString());

        setTotal(response.total);
        setClients((prev) => (page === 1 ? response.users : [...(prev || []), ...response.users]));
      } catch (error) {
        setErrorMessage(error as Error, 'Error fetching clients');
        setClients(null);
      } finally {
        setIsClientsLoading(false);
      }
    },
    [per_page, setErrorMessage],
  );

  const refetchClients = useCallback(
    (searchQuery: string = '') => {
      setCurrentPage(1);
      fetchAllClients(searchQuery, 1);
    },
    [fetchAllClients],
  );

  const fetchClientByUuidCallback = useCallback(
    async (uuid: string): Promise<User | null> => {
      try {
        const client = await fetchClientByUuid(uuid);
        return client;
      } catch (error) {
        setErrorMessage(error as Error, 'Ошибка при получении клиента по UUID');
        return null;
      }
    },
    [setErrorMessage],
  );

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
