import React, { FC, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { User } from '@prisma/client';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

// Определяем тип для частичного пользователя
export type PartialUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;

interface ClientSelectorProps {
  control: Control<FormOrderValues>;
  clients: PartialUser[] | null;
  selectedClientInfo: PartialUser | null;
  searchClient: string;
  handleSearchChange: (value: string) => void;
  handleClientSelection: (client: PartialUser) => void;
  loadMore: () => void;
  total: number;
  initialClient: PartialUser | undefined;
}

const ClientSelector: FC<ClientSelectorProps> = ({
  control,
  clients,
  selectedClientInfo,
  searchClient,
  handleSearchChange,
  handleClientSelection,
  loadMore,
  total,
  initialClient,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewClientMode, setIsNewClientMode] = useState(false);

  const handleToggleClientMode = () => {
    setIsNewClientMode((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Данные клиента</h3>
        <button
          type="button"
          className={`px-4 py-2 rounded transition-colors text-white ${
            isNewClientMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={handleToggleClientMode}
        >
          {isNewClientMode ? 'Выбрать существующего' : 'Указать нового клиента'}
        </button>
      </div>

      {isNewClientMode ? (
        // Режим ввода данных нового клиента
        <div className="w-full flex flex-col gap-4">
          <div className="w-full">
            <label className="block text-lg font-medium text-gray-700 mb-2">ФИО клиента</label>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  placeholder="Введите ФИО клиента"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              )}
            />
          </div>

          <div className="w-full">
            <label className="block text-lg font-medium text-gray-700 mb-2">Телефон</label>
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="tel"
                  {...field}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              )}
            />
          </div>
        </div>
      ) : (
        // Режим выбора существующего клиента
        <Controller
          name="createdBy"
          control={control}
          rules={{ required: !isNewClientMode ? 'Выберите клиента' : undefined }}
          render={({ field, fieldState }) => (
            <div className="w-full flex flex-col gap-4">
              <label className="block text-lg font-medium text-gray-700">
                Клиент (создатель заказа)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedClientInfo?.fullName || initialClient?.fullName || ''}
                  onClick={() => {
                    setIsOpen(true);
                    handleSearchChange('');
                  }}
                  readOnly
                  placeholder="Выберите клиента"
                  className={`w-full p-3 border rounded ${
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
                      placeholder="Поиск клиента..."
                      className="w-full p-3 border-b"
                    />
                    {clients && clients.length > 0 ? (
                      <>
                        {clients.map((client) => (
                          <div
                            key={client.uuid}
                            onClick={() => {
                              handleClientSelection(client);
                              setIsOpen(false);
                            }}
                            className="p-3 cursor-pointer hover:bg-gray-100"
                          >
                            {client.fullName} ({client.phone})
                          </div>
                        ))}
                        {clients.length < total && (
                          <div
                            onClick={() => {
                              loadMore();
                            }}
                            className="p-3 text-center text-blue-600 cursor-pointer hover:bg-gray-100"
                          >
                            Загрузить ещё
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-3 text-center text-gray-500">Клиенты не найдены</div>
                    )}
                  </div>
                )}
              </div>
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
              )}
              {selectedClientInfo && (
                <div className="mt-2 text-gray-600">
                  <p>Телефон: {selectedClientInfo.phone || initialClient?.phone || '-'}</p>
                </div>
              )}
            </div>
          )}
        />
      )}

      {/* Поля description и flightNumber (одинаковые для обоих режимов) */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => {
          const value =
            typeof field.value === 'object' && field.value !== null
              ? field.value.description || ''
              : field.value || '';

          return (
            <div className="w-full">
              <label className="block text-lg font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                placeholder="Введите описание заказа"
                className="w-full p-3 border border-gray-300 rounded resize-none h-24"
                value={value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </div>
          );
        }}
      />

      <Controller
        name="flightNumber"
        control={control}
        render={({ field }) => {
          const value =
            typeof field.value === 'object' && field.value !== null
              ? field.value.flightNumber || ''
              : field.value || '';

          return (
            <div className="w-full">
              <label className="block text-lg font-medium text-gray-700 mb-2">Номер рейса</label>
              <input
                type="text"
                placeholder="Введите номер рейса"
                className="w-full p-3 border border-gray-300 rounded"
                value={value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default ClientSelector;
