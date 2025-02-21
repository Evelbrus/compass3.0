import { useState, useCallback, useEffect, useRef } from 'react';
import { useClients } from '@features/orders/create/hooks';
import { CompanyProfile, User } from '@prisma/client';
import { useDebounce } from '@shared/utils/hooks/useDebounce';

export interface ExtendedUser extends User {
  companyProfile?: CompanyProfile | null;
}

interface UseOrderCreateClientsProps {
  assignedClientId?: string | null;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
}

export const useOrderCreateClients = ({
  assignedClientId,
  setErrorMessage,
}: UseOrderCreateClientsProps) => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<ExtendedUser | null>(null);
  const debouncedSearchClient = useDebounce(searchClient, 500);
  const isClientAssigned = useRef(false);

  const { clients, refetchClients, fetchClientByUuidCallback, loadMore, total, currentPage } =
    useClients({ setErrorMessage });

  //Эффект для загрузки назначенного клиента (режим редактирования)
  useEffect(() => {
    const fetchAssignedClient = async () => {
      if (assignedClientId) {
        const client = await fetchClientByUuidCallback(assignedClientId);
        if (client) {
          setSelectedClientInfo(client);
          isClientAssigned.current = true;
        }
      }
    };

    fetchAssignedClient();
  }, [assignedClientId, fetchClientByUuidCallback]);

  //Эффект для загрузки списка клиентов по умолчанию (режим создания)
  useEffect(() => {
    if (!assignedClientId) {
      refetchClients('');
    }
  }, [assignedClientId, refetchClients]);

  //Эффект для поиска клиентов при изменении debouncedSearchClient
  useEffect(() => {
    if (debouncedSearchClient !== undefined) {
      refetchClients(debouncedSearchClient);
    }
  }, [debouncedSearchClient, refetchClients]);

  //Обработчик изменения поискового запроса
  const handleSearchChange = useCallback((value: string) => {
    setSearchClient(value);
  }, []);

  //Возвращаемые значения
  return {
    clients,
    selectedClientInfo,
    searchClient,
    setSelectedClientInfo,
    handleSearchChange,
    refetchClients,
    loadMore,
    total,
    currentPage,
  };
};
