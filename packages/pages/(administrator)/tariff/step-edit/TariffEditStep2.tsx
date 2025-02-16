import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { serviceLevelOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const TariffEditStep2: React.FC = () => {
  const { control } = useFormContext();

  const handleFreeWaitTimeChange = (value: string | number) => {
    const numberValue = Number(value);
    return numberValue <= 60 ? numberValue : 60;
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-1/2">
      <div className="form-group">
        <Controller
          name="additionalPointPrice"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="additionalPointPrice"
              label="Фиксированая Цена за Каждую Дополнительную точку в поездку"
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
              label="Уровень обслуживания"
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
      <div className="form-group flex items-center justify-between">
        <p className="text-4 font-medium text-gray-500">
          Бесплатное время ожидания вне Аэропорта (Минуты)
        </p>
        <Controller
          name="freeWaitTimeBishkek"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="freeWaitTimeBishkek"
              value={field.value !== null ? handleFreeWaitTimeChange(field.value) : ''}
            />
          )}
        />
      </div>
      <div className="form-group">
        <p className="text-4 font-medium text-gray-500">
          Стоимость за каждую минуты после бесплатного времени ожидания (сумма)
        </p>
        <Controller
          name="pricePerMinuteAfterBishkek"
          control={control}
          render={({ field }) => (
            <TextInput type="number" {...field} placeholder="цена за минуту после Бишкека" />
          )}
        />
      </div>
      <div className="form-group flex justify-between items-center">
        <p className="text-4 font-medium text-gray-500">бесплатное время ожидания в аэропорту</p>
        <Controller
          name="freeWaitTimeAirport"
          control={control}
          render={({ field }) => (
            <TextInput
              type="number"
              {...field}
              placeholder="freeWaitTimeAirport"
              value={field.value !== null ? handleFreeWaitTimeChange(field.value) : ''}
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          name="pricePerMinuteAfterAirport"
          control={control}
          render={({ field }) => (
            <TextInput type="number" {...field} placeholder="цена за минуту после аэропорта" />
          )}
        />
      </div>
    </div>
  );
};

export default TariffEditStep2;
