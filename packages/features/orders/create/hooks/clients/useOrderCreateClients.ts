// @features/orders/create/hooks/useOrderCreateClients.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useClients } from '@features/orders/create/hooks/clients/useClients';
import { useDebounce } from '@shared/utils/hooks/useDebounce';
import { User } from '@prisma/client';
import { UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

export type PartialUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;

interface UseOrderCreateClientsProps {
  assignedClientId?: string | null;
  setValue: UseFormSetValue<FormOrderValues>;
}

export const useOrderCreateClients = ({
  assignedClientId,
  setValue,
}: UseOrderCreateClientsProps) => {
  const [searchClient, setSearchClient] = useState('');
  const [selectedClientInfo, setSelectedClientInfo] = useState<PartialUser | null>(null);
  const [savedClientInfo, setSavedClientInfo] = useState<PartialUser | null>(null); // Сохраняем последнего выбранного клиента

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
          console.log('Initial client loaded:', client);
          setSelectedClientInfo(client);
          setSavedClientInfo(client); // Сохраняем информацию о клиенте
          isClientAssigned.current = true;

          // Явно устанавливаем createdBy и phone
          setValue('createdBy', { uuid: client.uuid } as any);
          setValue('phone', client.phone || '');
        }
      }
    };

    fetchAssignedClient();
  }, [assignedClientId, fetchClientByUuidCallback, setValue]);

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
  const handleSearchChange = useCallback(
    (valueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
      // Проверяем, является ли аргумент событием или строкой
      if (typeof valueOrEvent === 'string') {
        setSearchClient(valueOrEvent);
      } else {
        setSearchClient(valueOrEvent.target.value);
      }
    },
    [],
  );

  const handleClientSelection = useCallback(
    (client: PartialUser | null) => {
      console.log('handleClientSelection called with client:', client);

      if (client === null) {
        // Если очищаем клиента, сохраняем текущий (если он есть) и очищаем форму
        if (selectedClientInfo) {
          setSavedClientInfo(selectedClientInfo);
        }
        setSelectedClientInfo(null);
        setValue('createdBy', { uuid: '' } as any);
        setValue('phone', '');
      } else {
        // Если выбираем клиента, сохраняем его и устанавливаем в форму
        setSelectedClientInfo(client);
        setSavedClientInfo(client);
        setValue('createdBy', { uuid: client.uuid } as any);

        // Устанавливаем телефон
        console.log('Setting phone from client:', client.phone);
        setValue('phone', client.phone || '');
      }
    },
    [setValue, selectedClientInfo],
  );

  return {
    clients: clients,
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
