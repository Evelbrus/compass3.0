import React from 'react';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
import { AdditionalService } from '@prisma/client';

interface AdditionalServicesListProps {
  label: string;
  availableServices: {
    service: AdditionalService;
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
  const selectedCount = selectedServices.length;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Дополнительные услуги */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          {label}
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>

        <p className="text-sm text-gray-600 mb-3">
          Общая стоимость ({selectedCount} доп. услуг):{' '}
          <span className="font-bold text-cyan-600">{totalAdditionalServicesPrice}с</span>
        </p>

        {availableServices.map(({ service, price, isAvailable, tariffOnServiceUuid }) => {
          const isSelected =
            tariffOnServiceUuid !== null && selectedServices.includes(tariffOnServiceUuid);

          return (
            <div
              key={service.uuid}
              className={cn(
                'flex items-center justify-between gap-4 p-2 rounded-md transition-all bg-white border',
                isSelected ? 'bg-cyan-50 border-cyan-200' : 'border-white hover:bg-cyan-50',
              )}
            >
              <CheckboxInput
                label={service.name}
                checked={isSelected}
                onChange={() => handleServiceSelection(service.uuid, price, isAvailable)}
                disabled={!isAvailable}
                className={cn(
                  !isAvailable ? 'opacity-50 line-through' : '',
                  'focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500',
                )}
              />
              <span
                className={cn(
                  'font-bold',
                  !isAvailable
                    ? 'text-gray-400 line-through'
                    : isSelected
                      ? 'text-cyan-600'
                      : 'text-gray-700',
                )}
              >
                {price}С
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdditionalServicesList;
