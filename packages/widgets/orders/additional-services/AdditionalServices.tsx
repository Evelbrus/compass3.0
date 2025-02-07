import React from 'react';
import {
  CreateOrderData,
  ExtendedTariff,
  TariffAdditionalService,
} from '@shared/prisma/interface/orders/interface';
import { Controller, useFormContext } from 'react-hook-form';
import { AdditionalService } from '@prisma/client';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { SelectedAdditionalService } from '@features/orders/create/hooks';

interface AdditionalServicesProps {
  selectedAdditionalServices: SelectedAdditionalService[];
  handleAdditionalServiceChangeCallback: (
    e: React.ChangeEvent<HTMLInputElement>,
    tariffOnServiceUuid: string,
  ) => void;
  availableAdditionalServices: (TariffAdditionalService & { service: AdditionalService })[];
  additionalServicesLabel: (selectedTariff: ExtendedTariff | null) => string | null;
  selectedTariff: ExtendedTariff | null;
}

const AdditionalServices: React.FC<AdditionalServicesProps> = ({
  selectedAdditionalServices,
  handleAdditionalServiceChangeCallback,
  availableAdditionalServices,
  additionalServicesLabel,
  selectedTariff,
}) => {
  const { control } = useFormContext<CreateOrderData>();

  return (
    <div className={'w-full flex flex-col gap-4'}>
      <div>
        <label htmlFor="flightNumber" className="block text-5 leading-5 mb-2 font-bold">
          Номер рейса:
        </label>
        <Controller
          name="flightNumber"
          control={control}
          render={({ field, fieldState }) => (
            <input
              type="text"
              id="flightNumber"
              {...field}
              className={`text-4 leading-4 p-3 w-full border rounded ${
                fieldState.error ? 'border-red-500' : 'border-gray-300'
              }`}
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <label className="block text-5 leading-5 font-bold">Дополнительные услуги</label>
        <span className="block text-3 leading-3 font-medium text-gray-500">
          Общая стоимость услуг {additionalServicesLabel(selectedTariff)}
        </span>
      </div>
      <ul className="space-y-2 border p-4 rounded-md">
        {availableAdditionalServices.map((s) => {
          //Типизация `s` убрана
          const tariffOnServiceUuid = s.uuid;
          const isChecked = selectedAdditionalServices.some(
            (selected) => selected.uuid === tariffOnServiceUuid,
          );
          const serviceName = s.service.name;
          const isDisabled = !s.isAvailable;
          const price = s.price;
          const isAvailable = s.isAvailable;

          return (
            <li key={tariffOnServiceUuid} className="flex items-center">
              <div
                style={{
                  textDecoration: isDisabled ? 'line-through' : 'none',
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  opacity: isDisabled ? 0.6 : 1,
                }}
              >
                <CheckboxInput
                  label={`${serviceName} ${isAvailable ? `(${price}с)` : ''}`}
                  checked={isChecked}
                  onChange={(e) => handleAdditionalServiceChangeCallback(e, tariffOnServiceUuid)}
                  className="w-full"
                  disabled={isDisabled}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdditionalServices;
