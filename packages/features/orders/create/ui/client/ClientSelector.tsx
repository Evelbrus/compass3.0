import React, { FC, useState, useEffect, useRef } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PhoneInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
import { Client } from '@features/orders/create/types/types';
import { UserRole } from '@prisma/client';
import { FIELD_STYLES, FieldStyle } from '@features/orders/create/ui/client/field-styles';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface ClientSelectorProps {
  control: Control<FormOrderValues>;
  clients: Client[] | null;
  selectedClientInfo: Client | null;
  savedClientInfo: Client | null;
  searchClient: string;
  handleSearchChange: (valueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => void;
  handleClientSelection: (client: Client | null) => void;
  loadMore: () => void;
  total: number;
  initialClient: Client | undefined;
  role: UserRole;
  userSession: UserSession | null | undefined;
}

// Указываем, что FieldHeader принимает только существующие ключи из FIELD_STYLES
const FieldHeader: FC<{ style: FieldStyle }> = ({ style }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${style.bgColor} ${style.textColor} font-bold shadow-md`}
    >
      {style.icon}
    </div>
    <div className={`font-semibold text-transparent bg-clip-text ${style.textGradient}`}>
      {style.name}
    </div>
  </div>
);

export const ClientSelector: FC<ClientSelectorProps> = ({
  control,
  clients,
  selectedClientInfo,
  savedClientInfo,
  searchClient,
  handleSearchChange,
  handleClientSelection,
  loadMore,
  total,
  initialClient,
  role,
  userSession,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Определяем, является ли пользователь клиентом (ClientCorp)
  const isClientCorp = role === UserRole.ClientCorp;
  const isEditMode = !!initialClient;

  // Слушатель клика вне выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleClientMode = () => {
    const newMode = !isNewClientMode;

    if (newMode) {
      handleClientSelection(null);
    } else {
      if (savedClientInfo) {
        handleClientSelection(savedClientInfo);
      }
    }

    setIsNewClientMode(newMode);
  };

  // Формируем URL для логотипа компании
  const getCompanyLogoSrc = () => {
    if (isClientCorp && userSession?.companyProfile?.logoImagePath) {
      return `/api/images/${userSession.companyProfile.logoImagePath.split('/').pop()}?type=logo`;
    }
    return null;
  };

  return (
    <div className="relative w-full rounded-lg p-6 bg-white-1">
      <div className="flex flex-row justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          {isClientCorp ? 'Информация о заказчике' : 'Данные клиента'}
          <div className="h-1 w-[500px] bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>

        {/* Кнопка "Указать нового клиента" отображается только для Admin и Operator в режиме создания */}
        {!isClientCorp && !isEditMode && (
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 ${
              isNewClientMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
            onClick={handleToggleClientMode}
          >
            {isNewClientMode ? 'Выбрать существующего' : 'Указать нового клиента'}
          </button>
        )}
      </div>

      <div className="bg-white p-4 border rounded-lg">
        {/* UUID клиента - скрытое поле для формы */}
        <Controller
          name="createdBy"
          control={control}
          defaultValue={
            isClientCorp
              ? { uuid: userSession?.uuid || '' }
              : initialClient
                ? { uuid: initialClient.uuid }
                : undefined
          }
          render={({ field }) => {
            // Для ClientCorp всегда устанавливаем userSession.uuid
            if (isClientCorp && userSession && field.value?.uuid !== userSession.uuid) {
              setTimeout(() => field.onChange({ uuid: userSession.uuid }), 0);
            }
            // Возвращаем скрытый input вместо null
            return (
              <input
                type="hidden"
                id={`hidden-${field.name}`}
                {...field}
                value={field.value?.uuid || ''}
              />
            );
          }}
        />

        {/* Для клиентов ClientCorp показываем информацию из userSession */}
        {isClientCorp ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-6">
              {/* ФИО пользователя */}
              <div className="flex-1">
                <FieldHeader style={FIELD_STYLES.fullName} />
                <input
                  type="text"
                  value={userSession?.fullName || ''}
                  placeholder="ФИО пользователя"
                  className="w-full p-3 rounded-md bg-gray-100 border border-gray-300 shadow-sm"
                  readOnly
                  disabled
                />
              </div>
              {/* Телефон пользователя */}
              <Controller
                name="phone"
                control={control}
                defaultValue={userSession?.phone || ''}
                render={({ field }) => (
                  <div className="flex-1">
                    <FieldHeader style={FIELD_STYLES.phone} />
                    <PhoneInput
                      value={field.value || userSession?.phone || ''}
                      onChange={(value) => field.onChange(value)}
                      label=""
                      required={false}
                      error={false}
                      disabled={false}
                      readOnly={true}
                      classNameLabel={'p-4'}
                    />
                  </div>
                )}
              />
            </div>

            <div className="flex flex-row gap-6">
              {/* Название компании */}
              <div className="flex-1">
                <FieldHeader style={FIELD_STYLES.companyName} />
                <input
                  type="text"
                  value={userSession?.companyProfile?.companyName || ''}
                  placeholder="Название компании"
                  className="w-full p-3 rounded-md bg-gray-100 border border-gray-300 shadow-sm"
                  readOnly
                  disabled
                />
              </div>

              {/* Телефон компании - используем PhoneInput */}
              <div className="flex-1">
                <FieldHeader style={FIELD_STYLES.companyPhone} />
                <PhoneInput
                  value={userSession?.companyProfile?.phone || ''}
                  onChange={() => {}} // Readonly поле
                  label=""
                  required={false}
                  error={false}
                  disabled={false}
                  readOnly={true}
                  classNameLabel={'p-4'}
                />
              </div>
            </div>
            {/* Логотип компании (если есть) */}
            {getCompanyLogoSrc() && (
              <div className="flex flex-col justify-end mb-4">
                <FieldHeader style={FIELD_STYLES.logo} />
                <img
                  src={getCompanyLogoSrc() || ''}
                  alt="Логотип компании"
                  className="w-[100px] max-h-24  rounded-md shadow-md"
                />
              </div>
            )}
          </div>
        ) : isNewClientMode && !isEditMode ? (
          // Режим создания нового клиента (только для Admin/Operator и не в режиме редактирования)
          <div className="flex flex-row gap-6">
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="flex-1">
                  <FieldHeader style={FIELD_STYLES.fullName} />
                  <input
                    type="text"
                    {...field}
                    placeholder="Введите ФИО клиента"
                    className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm"
                  />
                </div>
              )}
            />
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="flex-1">
                  <FieldHeader style={FIELD_STYLES.phone} />
                  <PhoneInput
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value)}
                    label=""
                    required={false}
                    error={false}
                    disabled={false}
                    readOnly={false}
                  />
                </div>
              )}
            />
          </div>
        ) : (
          // Режим выбора существующего клиента или режим редактирования
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-6">
              <Controller
                name="createdBy"
                control={control}
                render={({ fieldState }) => {
                  return (
                    <div className="relative w-full">
                      <FieldHeader style={FIELD_STYLES.client} />
                      <div className={'relative'}>
                        <input
                          value={selectedClientInfo?.fullName || initialClient?.fullName || ''}
                          onClick={() => {
                            if (!isEditMode) {
                              setIsOpen(true);
                              handleSearchChange('');
                            }
                          }}
                          onChange={isEditMode ? undefined : handleSearchChange}
                          readOnly={isEditMode || !isOpen}
                          placeholder="Выберите клиента..."
                          className={cn(
                            'w-full p-3 border-2 rounded-md shadow-sm',
                            isEditMode
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'bg-white cursor-pointer',
                            FIELD_STYLES.client.borderColor,
                            FIELD_STYLES.client.shadowColor,
                            fieldState.error ? 'border-red-500' : '',
                          )}
                        />
                        {selectedClientInfo && !isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleClientSelection(null)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition duration-200 hover:shadow-md"
                            aria-label="Очистить"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                      )}

                      {isOpen && !isEditMode && (
                        <div
                          className={cn(
                            'absolute left-0 right-0 mt-4 bg-white border-2 rounded-lg shadow-lg max-h-[250px] overflow-y-auto',
                            FIELD_STYLES.client.borderColor,
                          )}
                        >
                          <div className="sticky top-0 bg-white p-3 border-b">
                            <input
                              type="text"
                              autoFocus
                              value={searchClient}
                              onChange={handleSearchChange}
                              placeholder="Поиск клиента..."
                              className="p-2 w-full border rounded-md bg-gray-50"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div>
                            {clients && clients.length > 0 ? (
                              <>
                                {clients.map((client) => (
                                  <div
                                    key={client.uuid}
                                    onClick={() => {
                                      handleClientSelection(client);
                                      setIsOpen(false);
                                    }}
                                    className={cn(
                                      'p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition duration-150',
                                    )}
                                  >
                                    <span>
                                      {client.fullName} ({client.phone})
                                    </span>
                                  </div>
                                ))}
                                {clients.length < total && (
                                  <div
                                    onClick={loadMore}
                                    className="p-3 text-center text-cyan-600 cursor-pointer hover:bg-cyan-50 transition-all"
                                  >
                                    Загрузить ещё
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <svg
                                  className="w-6 h-6 text-gray-400 mx-auto mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Клиенты не найдены
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              <Controller
                name="phone"
                control={control}
                key={`phone-${selectedClientInfo?.uuid || savedClientInfo?.uuid || 'default'}`}
                defaultValue={(selectedClientInfo || savedClientInfo || initialClient)?.phone || ''}
                render={({ field }) => {
                  return (
                    <div className="relative w-full">
                      <FieldHeader style={FIELD_STYLES.phone} />
                      <PhoneInput
                        value={field.value || ''}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        label=""
                        required={false}
                        error={false}
                        disabled={isEditMode}
                        readOnly={!!selectedClientInfo || isEditMode}
                        classNameLabel={'p-4'}
                      />
                    </div>
                  );
                }}
              />
            </div>
          </div>
        )}

        <div className={`${isClientCorp ? 'w-full' : 'w-1/2'} flex flex-col gap-4`}>
          <div className="w-full flex flex-row gap-6 items-stretch">
            <Controller
              name="flightNumber"
              control={control}
              render={({ field }) => {
                const value =
                  typeof field.value === 'object' && field.value !== null
                    ? field.value.flightNumber || ''
                    : '';
                return (
                  <div className="w-full">
                    <FieldHeader style={FIELD_STYLES.flight} />
                    <input
                      type="text"
                      placeholder="Введите номер рейса"
                      className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                      value={value}
                      onChange={(e) => field.onChange({ flightNumber: e.target.value })}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </div>
                );
              }}
            />
          </div>

          <div className="w-full flex flex-row gap-6 items-stretch">
            <Controller
              name="description"
              control={control}
              render={({ field }) => {
                const value =
                  typeof field.value === 'object' && field.value !== null
                    ? field.value.description || ''
                    : '';
                return (
                  <div className="w-full">
                    <FieldHeader style={FIELD_STYLES.description} />
                    <textarea
                      placeholder="Введите описание заказа"
                      className="w-full p-3 rounded-md bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 resize-none h-24"
                      value={value}
                      onChange={(e) => field.onChange({ description: e.target.value })}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;
