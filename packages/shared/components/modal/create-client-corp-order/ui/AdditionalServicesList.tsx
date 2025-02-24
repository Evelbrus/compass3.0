//AdditionalServicesList.tsx
import React from 'react';
//import { AdditionalService } from '@prisma/client'; // Не нужен, если используем availableServices
import { CheckboxInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';

interface AdditionalServicesListProps {
  label: string;
  availableServices: {
    service: any; //Лучше использовать  AdditionalService, если импортирован в useAdditionalServices
    price: number;
    isAvailable: boolean;
    tariffOnServiceUuid: string | null; //Добавляем tariffOnServiceUuid
  }[];
  selectedServices: string[];
  handleServiceSelection: (serviceUuid: string, price: number, isAvailable: boolean) => void;
  totalAdditionalServicesPrice: number;
}

const AdditionalServicesList: React.FC<AdditionalServicesListProps> = ({
  label,
  availableServices,
  handleServiceSelection,
  selectedServices,
  totalAdditionalServicesPrice,
}) => {
  const selectedCount = selectedServices.length; //Больше не нужно фильтровать по Boolean

  return (
    <div className="w-full flex flex-col gap-2">
      <label className={'flex p-2 border rounded-md bg-[#989898] text-white'}>{label}</label>
      <p className="text-sm text-gray-500">
        Общая стоимость ({selectedCount} доп. услуг {totalAdditionalServicesPrice}с){' '}
        {/*Изменили текст*/}
      </p>
      {availableServices.map(
        (
          { service, price, isAvailable, tariffOnServiceUuid },
        ) => (
          <div key={service.uuid} className="flex items-center justify-between gap-4">
            <CheckboxInput
              label={service.name}
              checked={selectedServices.includes(tariffOnServiceUuid || '')}
              onChange={() => handleServiceSelection(service.uuid, price, isAvailable)}
              disabled={!isAvailable}
              className={cn(!isAvailable ? 'opacity-50 line-through' : '')}
            />
            <span className={cn('font-bold', !isAvailable ? 'text-gray-400 line-through' : '')}>
              {price}C
            </span>
          </div>
        ),
      )}
    </div>
  );
};

export default AdditionalServicesList;
