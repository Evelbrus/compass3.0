import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { vehicleTypeOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const TariffEditStep1: React.FC = () => {
  const { control } = useFormContext();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <div className="form-group">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Tariff name is required' }}
          render={({ field }) => (
            <TextInput {...field} placeholder="Enter tariff name" label="Tariff Name" />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="vehicleType"
          control={control}
          rules={{ required: 'Vehicle type is required' }}
          render={({ field }) => (
            <SelectSingle
              label="Vehicle Type"
              classNameLabel="block text-4 font-medium text-gray-500 mb-2"
              {...field}
              options={vehicleTypeOptions}
              value={vehicleTypeOptions.find((option) => option.value === field.value) || null}
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              placeholder="Select vehicle type"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              placeholder="Enter description"
              label="Description"
              value={field.value ?? ''}
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              placeholder="price"
              label="Price"
              value={field.value}
              type="number"
            />
          )}
        />
      </div>
    </div>
  );
};

export default TariffEditStep1;
