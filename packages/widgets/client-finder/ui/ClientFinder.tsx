'use client';

import React, { useState } from 'react';
import { PhoneInput, Select } from '@shared/components/ui/inputs';
import { Option } from '@shared/lib/effector';
import { clientOptions, clientPhoneNumbers } from '@widgets/client-finder';

const ClientFinderPage: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Option<string> | null>(clientOptions[0]); // Инициализируем с "Не выбрано"
  const [filteredClients, setFilteredClients] = useState<Option<string>[]>(clientOptions);
  const [isPhoneDisabled, setIsPhoneDisabled] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClientChange = (option: Option<string> | null) => {
    setSelectedClient(option);
    if (option && option.value && clientPhoneNumbers[option.value]) {
      setPhone(clientPhoneNumbers[option.value]);
      setIsPhoneDisabled(true);
    } else {
      setPhone('');
      setIsPhoneDisabled(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-row space-x-4">
          <div className="flex-1">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              label="Номер телефона:"
              required
              error={false}
              disabled={isPhoneDisabled}
            />
          </div>

          <div className="flex-1">
            <Select
              options={filteredClients}
              label="Поиск клиентов:"
              placeholder="Введите имя клиента или выберите 'Не выбрано'"
              value={selectedClient}
              onChange={handleClientChange}
              className="w-full"
              classNamePlaceholder="text-gray-500"
              classNameTagUl="top-20 overflow-y-auto"
              classNameTagLi="p-2 hover:bg-gray-100 cursor-pointer"
              classNameLabel="mb-4 text-[14px] leading-3 text-gray-400"
              classNameBorderRadius="border border-gray-300 rounded-lg"
              hideArrow={false}
              isSearchable
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientFinderPage;
