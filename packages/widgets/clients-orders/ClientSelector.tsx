'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { ExtendedUser } from '@features/orders/create/hooks';

interface ClientSelectorProps {
  clients: ExtendedUser[] | null;
  searchClient: string;
  handleSearchChange: (value: string) => void;
  selectedClientInfo: ExtendedUser | null;
  setSelectedClientInfo: (client: User | null) => void;
  loadMore: () => void;
  total: number;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  searchClient,
  handleSearchChange,
  selectedClientInfo,
  setSelectedClientInfo,
  loadMore,
  total,
}) => {
  const { control, formState, setValue, reset } = useFormContext<CreateOrderData>();

  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>('');
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  //Определение, достигли ли конца списка
  const isAtLastPage = useMemo(
    () => clients && total > 0 && clients.length >= total,
    [clients, total],
  );

  const handleToggleClientMode = () => {
    setIsNewClientMode((prev) => !prev);

    reset(
      {
        fullName: '',
        phone: '',
        createdBy: undefined,
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
      },
    );

    setPhoneValue('');
    setSelectedClientInfo(null);
  };

  useEffect(() => {
    setPhoneValue(selectedClientInfo?.phone || '');
  }, [selectedClientInfo]);

  const handleClientSelection = useCallback(
    (client: User) => {
      setSelectedClientInfo(client);
      setValue('createdBy', client.uuid, { shouldValidate: true });
      setPhoneValue(client.phone || '');
      setIsOpen(false);
    },
    [setSelectedClientInfo, setValue],
  );

  //IntersectionObserver
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoadingRef.current && !isAtLastPage) {
        isLoadingRef.current = true;
        loadMore();
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMore, isAtLastPage]);

  //Сброс состояния загрузки
  useEffect(() => {
    isLoadingRef.current = false;
  }, [clients]);

  //Обработка клика вне области селектора
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.client-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const clientOptions = useMemo(() => {
    return (
      clients?.map((client) => ({
        label: client.fullName,
        value: client.uuid,
        key: client.uuid,
      })) || []
    );
  }, [clients]);

  const validateSelection = useCallback(
    (selectedClient: ExtendedUser | null, options: Array<{ value: string }>) => {
      if (selectedClient && !options.some((opt) => opt.value === selectedClient.uuid)) {
        setValue('createdBy', '');
        setSelectedClientInfo(null);
        setPhoneValue('');
      }
    },
    [setValue, setSelectedClientInfo, setPhoneValue],
  );

  useEffect(() => {
    validateSelection(selectedClientInfo, clientOptions);
  }, [clientOptions, selectedClientInfo, validateSelection]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between items-center">
        <h1 className={'block text-6 leading-6 font-bold'}>Карточка клиента</h1>
        <button
          type="button"
          className={`min-w-[200px] p-3 rounded transition-colors text-4 leading-4 text-white ${
            isNewClientMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={handleToggleClientMode}
        >
          {isNewClientMode ? 'Поиск клиентов' : 'Новый клиент'}
        </button>
      </div>

      <div className={'border'}></div>

      <div className="w-full flex items-start justify-between gap-4">
        {/*Блок телефона */}
        <div className="w-full flex flex-col">
          <label className="block mb-4 text-5 leading-5 font-bold">
            {isNewClientMode ? 'Телефон клиента:' : 'Номер клиента:'}
          </label>

          {/*Поле телефона */}
          {isNewClientMode ? (
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              rules={{ required: 'Введите номер телефона' }}
              render={({ field, fieldState }) => (
                <input
                  {...field}
                  type="tel"
                  value={field.value || phoneValue}
                  placeholder="+7 (999) 999-99-99"
                  className={`text-4 leading-4 p-3 w-full border rounded ${
                    fieldState.error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
          ) : (
            <input
              value={phoneValue || ''}
              readOnly
              placeholder="Не выбран"
              className="w-full p-3 bg-white rounded border border-gray-300 text-black text-4 leading-4"
            />
          )}

          {/*Ошибка для поля телефона */}
          {isNewClientMode && formState.errors.phone && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.phone.message}</p>
          )}
        </div>

        {/*Блок выбора/создания клиента */}
        <div className={`w-full flex flex-col client-selector`}>
          <label className="block mb-4 text-5 leading-5 font-bold">
            {isNewClientMode ? 'Создание клиента:' : 'Клиент:'}
          </label>

          {/*Поле ФИО */}
          {isNewClientMode ? (
            <>
              <Controller
                name="fullName"
                control={control}
                defaultValue=""
                rules={{ required: 'Введите ФИО клиента' }}
                render={({ field, fieldState }) => (
                  <input
                    {...field}
                    type="text"
                    value={field.value || ''}
                    placeholder="Иванов Иван Иванович"
                    className={`text-4 leading-4 p-3 w-full border rounded ${
                      fieldState.error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
              />
            </>
          ) : (
            <Controller
              name="createdBy"
              control={control}
              defaultValue={undefined}
              rules={{ required: 'Выберите клиента' }}
              render={({ field, fieldState }) => (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedClientInfo?.fullName || ''}
                      onClick={() => {
                        setIsOpen(!isOpen);
                        if (!selectedClientInfo) {
                          handleSearchChange('');
                        }
                      }}
                      placeholder="Клиенты"
                      readOnly
                      className={`text-4 leading-4 p-3 w-full border rounded ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />

                    {isOpen && (
                      <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
                        <input
                          type="text"
                          autoFocus
                          value={searchClient}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Поиск..."
                          className="text-4 leading-4 p-3 w-full border-b"
                        />
                        {clientOptions.map((option) => (
                          <div
                            key={option.key}
                            onClick={() => {
                              const client = clients?.find((c) => c.uuid === option.value) || null;
                              if (client) {
                                handleClientSelection(client);
                              }
                            }}
                            className="p-3 cursor-pointer hover:bg-gray-100"
                          >
                            {option.label}
                          </div>
                        ))}
                        {/*Скрываем сообщение, если достигли конца списка */}
                        {!isAtLastPage && (
                          <div ref={loaderRef} className="p-2 text-center text-gray-500">
                            {isLoadingRef.current ? 'Загрузка...' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          )}

          <div className="flex items-center justify-start gap-2 mt-4">
            <label className="block text-4 leading-4 font-medium">Тип клиента:</label>
            <span className="flex-1 bg-white border border-gray-300 p-3 rounded text-black text-4 leading-4">
              {isNewClientMode
                ? 'Аноним'
                : selectedClientInfo
                  ? roleTranslations[selectedClientInfo.role]
                  : 'Клиент не выбран'}
            </span>
          </div>

          {selectedClientInfo?.role === UserRole.ClientCorp &&
            selectedClientInfo?.companyProfile && (
              <div className="w-full flex flex-col items-start justify-start gap-2 mt-4">
                <label className="block text-4 leading-4 font-medium">Название компании:</label>
                <span className="w-full flex-1 bg-white border border-gray-300 p-3 rounded text-black text-4 leading-4">
                  {selectedClientInfo.companyProfile.companyName}
                </span>
              </div>
            )}

          {/*Ошибка для поля ФИО */}
          {isNewClientMode && formState.errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.fullName.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;
