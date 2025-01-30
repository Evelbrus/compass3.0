//hooks/useClients.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from '@prisma/client';
import { fetchClients } from '@features/orders/create/api/orderApi';

interface UseClientsProps {
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

interface UseClientsResult {
  clients: User[] | null;
  isClientsLoading: boolean;
  refetchClients: (searchQuery?: string) => void;
}

export const useClients = ({ setErrorMessage }: UseClientsProps): UseClientsResult => {
  const [clients, setClients] = useState<User[] | null>(null);
  const [isClientsLoading, setIsLoading] = useState<boolean>(true);

  const fetchAllClients = useCallback(
    async (searchQuery?: string) => {
      setIsLoading(true);
      try {
        const clientsData = await fetchClients(searchQuery);
        setClients(clientsData);
      } catch (error) {
        setErrorMessage(error, 'Error fetching clients');
        setClients(null);
      } finally {
        setIsLoading(false);
      }
    },
    [setErrorMessage],
  );

  const refetchClients = useCallback(
    (searchQuery?: string) => {
      fetchAllClients(searchQuery);
    },
    [fetchAllClients],
  );

  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  return {
    clients,
    isClientsLoading,
    refetchClients,
  };
};
