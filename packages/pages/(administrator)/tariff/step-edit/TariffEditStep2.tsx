import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { serviceLevelOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const TariffEditStep2: React.FC = () => {
  const { control } = useFormContext();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <div className="form-group">
        <Controller
          name="additionalPointPrice"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="additionalPointPrice"
              label="additionalPointPrice"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="freeWaitTimeBishkek"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="freeWaitTimeBishkek"
              label="freeWaitTimeBishkek"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="pricePerMinuteAfterBishkek"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="pricePerMinuteAfterBishkek"
              label="pricePerMinuteAfterBishkek"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="freeWaitTimeAirport"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="freeWaitTimeAirport"
              label="freeWaitTimeAirport"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="pricePerMinuteAfterAirport"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="pricePerMinuteAfterAirport"
              label="pricePerMinuteAfterAirport"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="serviceLevel"
          control={control}
          rules={{ required: 'Service level is required' }}
          render={({ field }) => (
            <SelectSingle
              label="Service Level:"
              classNameLabel="block text-4 font-medium text-gray-500 mb-2"
              {...field}
              options={serviceLevelOptions}
              value={serviceLevelOptions.find((option) => option.value === field.value) || null}
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              placeholder="Select service level"
            />
          )}
        />
      </div>
    </div>
  );
};

export default TariffEditStep2;
