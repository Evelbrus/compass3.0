import React from 'react';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';

interface AdditionalServicesListProps {
  label: string;
  availableServices: {
    service: any; // AdditionalService
    price: number;
    isAvailable: boolean;
    tariffOnServiceUuid: string | null;
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
  // Отладочный лог
  console.log('AdditionalServicesList Render:');
  console.log(
    'Available services:',
    availableServices.map((s) => ({
      name: s.service.name,
      uuid: s.service.uuid,
      tariffUuid: s.tariffOnServiceUuid,
    })),
  );
  console.log('Selected services:', selectedServices);

  const selectedCount = selectedServices.length;

  return (
    <div className="w-full flex flex-col gap-2">
      <label className={'flex p-2 border rounded-md bg-[#989898] text-white'}>{label}</label>
      <p className="text-sm text-gray-500">
        Общая стоимость ({selectedCount} доп. услуг {totalAdditionalServicesPrice}с)
      </p>
      {availableServices.map(({ service, price, isAvailable, tariffOnServiceUuid }) => {
        // Проверяем, содержится ли tariffOnServiceUuid в массиве selectedServices
        const isSelected =
          tariffOnServiceUuid !== null && selectedServices.includes(tariffOnServiceUuid);

        return (
          <div key={service.uuid} className="flex items-center justify-between gap-4">
            <CheckboxInput
              label={service.name}
              checked={isSelected}
              onChange={() => handleServiceSelection(service.uuid, price, isAvailable)}
              disabled={!isAvailable}
              className={cn(!isAvailable ? 'opacity-50 line-through' : '')}
            />
            <span className={cn('font-bold', !isAvailable ? 'text-gray-400 line-through' : '')}>
              {price}C
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AdditionalServicesList;
