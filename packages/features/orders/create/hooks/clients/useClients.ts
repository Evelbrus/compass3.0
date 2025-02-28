import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClientByUuid, fetchClients } from '@features/orders/create/api/orders.api';
import { User } from '@prisma/client';

// Определяем тип для частичного пользователя
export type PartialUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;

interface UseClientsProps {
  per_page?: number;
}

export const useClients = ({ per_page = 4 }: UseClientsProps) => {
  // Изменяем тип состояния на массив PartialUser
  const [clients, setClients] = useState<PartialUser[] | null>(null);
  const [isClientsLoading, setIsClientsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const prevSearchRef = useRef<string | undefined>(undefined);

  const fetchAllClients = useCallback(
    async (searchQuery: string = '', page: number = 1) => {
      try {
        setIsClientsLoading(true);

        if (prevSearchRef.current === searchQuery && page === currentPage) return;
        prevSearchRef.current = searchQuery;

        const response = await fetchClients(searchQuery, page.toString(), per_page.toString());

        setTotal(response.total);

        // Корректно обрабатываем массив, обеспечивая правильную типизацию
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
    [per_page, currentPage],
  );

  const refetchClients = useCallback(
    (searchQuery: string = '') => {
      setCurrentPage(1);
      fetchAllClients(searchQuery, 1);
    },
    [fetchAllClients],
  );

  const fetchClientByUuidCallback = useCallback(
    async (uuid: string): Promise<PartialUser | null> => {
      try {
        const client = await fetchClientByUuid(uuid);
        return client;
      } catch (error) {
        return null;
      }
    },
    [],
  );

  const loadMore = useCallback(() => {
    // Корректная проверка наличия дополнительных элементов
    const hasMore = clients !== null && clients.length < total;
    if (hasMore && !isClientsLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAllClients(prevSearchRef.current || '', nextPage);
    }
  }, [isClientsLoading, currentPage, fetchAllClients, total, clients]);

  // Сброс currentPage при изменении searchQuery
  useEffect(() => {
    if (prevSearchRef.current !== undefined) {
      setCurrentPage(1);
    }
  }, [prevSearchRef.current]);

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
