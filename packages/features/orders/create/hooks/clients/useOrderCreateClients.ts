import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useClients } from '@features/orders/create/hooks/clients/useClients';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { UseFormSetValue } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { Client } from '@features/orders/create/types/types';
import { UserRole } from '@prisma/client';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface UseOrderCreateClientsProps {
  assignedClientId?: string | null;
  setValue: UseFormSetValue<FormOrderValues>;
  userSession?: UserSession | null;
  role?: UserRole;
}

export const useOrderCreateClients = ({
  assignedClientId,
  setValue,
  role,
}: UseOrderCreateClientsProps) => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<Client | null>(null);
  const [savedClientInfo, setSavedClientInfo] = useState<Client | null>(null);
  const [clientInitialized, setClientInitialized] = useState(false);

  const debouncedSearchClient = useDebounce(searchClient, 500);
  const isClientCorp = role === UserRole.ClientCorp;

  // Используем параметр disabled для отключения запросов при role === UserRole.ClientCorp
  const { clients, refetchClients, fetchClientByUuidCallback, loadMore, total, currentPage } =
    useClients({
      disabled: isClientCorp,
    });

  // Один useEffect для загрузки клиента по ID и обновления поиска
  useEffect(() => {
    // Если это ClientCorp, не делаем запрос
    if (isClientCorp) return;

    // Загрузка по ID если есть, или загрузка списка клиентов
    if (assignedClientId && !clientInitialized) {
      fetchClientByUuidCallback(assignedClientId).then((client) => {
        if (client) {
          setSelectedClientInfo(client);
          setSavedClientInfo(client);
          setValue('createdBy', { uuid: client.uuid } as any);
          setValue('phone', client.phone || '');
          setClientInitialized(true);
        }
      });
    } else if (!assignedClientId && !clientInitialized) {
      refetchClients('');
      setClientInitialized(true);
    }

    // Обновление списка при изменении поискового запроса
    if (debouncedSearchClient !== undefined) {
      refetchClients(debouncedSearchClient);
    }
  }, [
    assignedClientId,
    debouncedSearchClient,
    fetchClientByUuidCallback,
    refetchClients,
    setValue,
    isClientCorp,
    clientInitialized,
  ]);

  const handleSearchChange = useCallback(
    (valueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
      if (typeof valueOrEvent === 'string') {
        setSearchClient(valueOrEvent);
      } else {
        setSearchClient(valueOrEvent.target.value);
      }
    },
    [],
  );

  const handleClientSelection = useCallback(
    (client: Client | null) => {
      if (client === null) {
        if (selectedClientInfo) {
          setSavedClientInfo(selectedClientInfo);
        }
        setSelectedClientInfo(null);
        setValue('createdBy', { uuid: '' } as any);
        setValue('phone', '');
      } else {
        setSelectedClientInfo(client);
        setSavedClientInfo(client);
        setValue('createdBy', { uuid: client.uuid } as any);
        setValue('phone', client.phone || '');
      }
    },
    [setValue, selectedClientInfo],
  );

  return {
    clients,
    selectedClientInfo,
    savedClientInfo,
    searchClient,
    handleSearchChange,
    handleClientSelection,
    loadMore,
    total,
    currentPage,
  };
};
