import React from 'react';
import Icon from '@shared/components/ui/icon/Icon';
import { countryData, validateAndFormatPhone } from '@shared/components/ui/inputs/phone';
import { handleEdit } from '@shared/components/ui/table/handlers/handleEdit';
import { handleDownload } from '@shared/components/ui/table/handlers/handleDownload';
import { handleDelete } from '@shared/components/ui/table/handlers/handleDelete';
import { handleDetail } from '@shared/components/ui/table/handlers/handleDetail';

export const renderActions = (
  entity?: 'users' | 'orders' | 'vehicles',
  uuid?: string,
  navigate?: (path: string) => void,
) => (
  <div className="flex">
    <div
      className="p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300"
      onClick={() => handleDetail(entity, uuid, navigate)}
    >
      <Icon name="edit" alt="Редактировать" className="w-6 h-6 text-blue-500 hover:text-blue-700" />
    </div>
    <div
      className="p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300"
      onClick={() => handleEdit(entity, uuid, navigate)}
    >
      <Icon name="edit" alt="Редактировать" className="w-6 h-6 text-blue-500 hover:text-blue-700" />
    </div>
    <div
      className="p-2 hover:bg-green-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300"
      //onClick={() => handleDownload(uuid, navigate)}
    >
      <Icon
        name="download"
        alt="Скачать"
        className="relative left-[1.5px] text-green-500 hover:text-green-700"
      />
    </div>
    <div
      className="p-2 hover:bg-red-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300"
      onClick={() => handleDelete(entity, uuid)}
    >
      <Icon
        name="delete"
        alt="Удалить"
        className="relative left-[1.5px] w-6 h-6 text-red-500 hover:text-red-700"
      />
    </div>
  </div>
);

export const renderDateTime = (date: string | Date) => {
  const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formattedTime = new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-1">
      <span>{formattedDate}</span>
      <span className="text-gray-500 text-sm">{formattedTime}</span>
    </div>
  );
};

export const renderCustomerPhone = (phone: string, fullName: string) => {
  const { isValid, formatted } = validateAndFormatPhone(phone);

  const cleanedPhone = phone.replace(/\D/g, '');
  const country = countryData.find((c) => cleanedPhone.startsWith(c.dialCode.replace('+', '')));

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-start">
        <div className="flex flex-row justify-center items-center gap-2">
          {isValid && country && (
            <div className="relative group">
              <img
                src={country.flag}
                alt={country.name}
                className="w-6 h-6 object-contain cursor-pointer"
              />
              <div className="absolute top-full transform mt-1 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {country.name}
              </div>
            </div>
          )}
          <span>{isValid ? formatted : phone}</span>
        </div>
        <span className="text-gray-500 text-sm">{fullName}</span>
      </div>
    </div>
  );
};

export const renderAddress = (city: string, address: string) => (
  <div className="flex flex-col gap-1">
    <span>{city}</span>
    <span>{address}</span>
  </div>
);

export const renderAuto = (brand: string, model: string) => (
  <div className="flex flex-col gap-1">
    <span>{brand}</span>
    <span>{model}</span>
  </div>
);
