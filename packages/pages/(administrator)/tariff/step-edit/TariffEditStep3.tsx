import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CheckboxInput, TextInput } from '@shared/components/ui/inputs';

interface TariffEditProps {
  data: {
    tariffAdditionalServices: Array<{
      service: { uuid: string; name: string };
      price: number;
      isAvailable: boolean;
    }>;
  };
}

const TariffEditStep3: React.FC<TariffEditProps> = ({ data }) => {
  const { control, watch } = useFormContext();
  return (
    <div className="p-4 bg-white border-t border-gray-300 grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {data.tariffAdditionalServices.map((service, index) => (
        <div key={service.service.uuid} className="flex items-center gap-[12px]">
          <Controller
            name={`tariffAdditionalServices.${index}.price`}
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Enter price"
                type="number"
                label={service.service.name}
              />
            )}
          />
          <div className="mt-[30px]">
            <Controller
              name={`tariffAdditionalServices.${index}.isAvailable`}
              control={control}
              render={({ field }) => (
                <CheckboxInput {...field} label="Available" checked={field.value} />
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TariffEditStep3;
