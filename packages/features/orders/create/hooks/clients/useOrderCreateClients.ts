import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useClients } from './useClients';
import { User } from '@prisma/client';
import useDebounce from '@shared/utils/hooks/useDebounce';

interface UseOrderCreateClientsProps {
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

interface UseOrderCreateClientsResult {
  clients: User[] | null;
  isClientsLoading: boolean;
  searchClient: string;
  setSearchClient: React.Dispatch<React.SetStateAction<string>>;
  refetchClients: () => void;
  selectedClientInfo: User | null;
  setSelectedClientInfo: React.Dispatch<React.SetStateAction<User | null>>;
}

export const useOrderCreateClients = ({
  setErrorMessage,
}: UseOrderCreateClientsProps): UseOrderCreateClientsResult => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<User | null>(null);
  const debouncedSearchValue = useDebounce(searchClient, 500);
  const {
    clients,
    isClientsLoading,
    refetchClients: refetchClientsFromUseClients,
  } = useClients({ setErrorMessage });

  const refetchClients = useCallback(() => {
    refetchClientsFromUseClients(debouncedSearchValue);
  }, [debouncedSearchValue, refetchClientsFromUseClients]);

  useEffect(() => {
    refetchClientsFromUseClients(debouncedSearchValue);
  }, [debouncedSearchValue, refetchClientsFromUseClients]);

  return {
    clients,
    isClientsLoading,
    searchClient,
    setSearchClient,
    refetchClients,
    selectedClientInfo,
    setSelectedClientInfo,
  };
};
