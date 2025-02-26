// @features/orders/create/hooks/useOrderCreateClients.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useClients } from '@features/orders/create/hooks/clients/useClients';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { User } from '@prisma/client';
import { UseFormSetValue } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

interface UseOrderCreateClientsProps {
  assignedClientId?: string | null;
  setValue: UseFormSetValue<FormOrderValues>;
}

export const useOrderCreateClients = ({
  assignedClientId,
  setValue,
}: UseOrderCreateClientsProps) => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<Pick<
    User,
    'uuid' | 'fullName' | 'email' | 'phone' | 'role'
  > | null>(null);
  const debouncedSearchClient = useDebounce(searchClient, 500);
  const isClientAssigned = useRef(false);

  const { clients, refetchClients, fetchClientByUuidCallback, loadMore, total, currentPage } =
    useClients({});

  // Эффект для загрузки назначенного клиента (режим редактирования)
  useEffect(() => {
    const fetchAssignedClient = async () => {
      if (assignedClientId && !isClientAssigned.current) {
        const client = await fetchClientByUuidCallback(assignedClientId);
        if (client) {
          setSelectedClientInfo(client);
          isClientAssigned.current = true;
        }
      }
    };

    fetchAssignedClient();
  }, [assignedClientId, fetchClientByUuidCallback]);

  // Эффект для загрузки списка клиентов по умолчанию (режим создания)
  useEffect(() => {
    if (!assignedClientId && !clients) {
      refetchClients('');
    }
  }, [assignedClientId, refetchClients, clients]);

  // Эффект для поиска клиентов при изменении debouncedSearchClient
  useEffect(() => {
    if (debouncedSearchClient !== undefined) {
      refetchClients(debouncedSearchClient);
    }
  }, [debouncedSearchClient, refetchClients]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = useCallback((value: string) => {
    setSearchClient(value);
  }, []);

  const handleClientSelection = (
    client: Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>,
  ) => {
    setSelectedClientInfo(client);
    setValue('createdBy', client);
  };

  return {
    clients: clients,
    selectedClientInfo,
    searchClient,
    setSelectedClientInfo,
    handleSearchChange,
    loadMore,
    total,
    currentPage,
    handleClientSelection,
  };
};
