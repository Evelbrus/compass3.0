import React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useClients } from '@features/orders/create/hooks/clients/useClients';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { UseFormSetValue } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { Client } from '@features/orders/create/types/types';

interface UseOrderCreateClientsProps {
  assignedClientId?: string | null;
  setValue: UseFormSetValue<FormOrderValues>;
}

export const useOrderCreateClients = ({
  assignedClientId,
  setValue,
}: UseOrderCreateClientsProps) => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<Client | null>(null);
  const [savedClientInfo, setSavedClientInfo] = useState<Client | null>(null);

  const debouncedSearchClient = useDebounce(searchClient, 500);
  const isClientAssigned = useRef(false);

  const { clients, refetchClients, fetchClientByUuidCallback, loadMore, total, currentPage } =
    useClients({});

  useEffect(() => {
    const fetchAssignedClient = async () => {
      if (assignedClientId && !isClientAssigned.current) {
        const client = await fetchClientByUuidCallback(assignedClientId);
        if (client) {
          console.log('Initial client loaded:', client);
          setSelectedClientInfo(client);
          setSavedClientInfo(client);
          isClientAssigned.current = true;

          setValue('createdBy', { uuid: client.uuid } as any);
          setValue('phone', client.phone || '');
        }
      }
    };

    fetchAssignedClient();
  }, [assignedClientId, fetchClientByUuidCallback, setValue]);

  useEffect(() => {
    if (!assignedClientId && !clients) {
      refetchClients('');
    }
  }, [assignedClientId, refetchClients, clients]);

  useEffect(() => {
    if (debouncedSearchClient !== undefined) {
      refetchClients(debouncedSearchClient);
    }
  }, [debouncedSearchClient, refetchClients]);

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
      console.log('handleClientSelection called with client:', client);

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

        console.log('Setting phone from client:', client.phone);
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
    setSelectedClientInfo,
    handleSearchChange,
    loadMore,
    total,
    currentPage,
    handleClientSelection,
  };
};
