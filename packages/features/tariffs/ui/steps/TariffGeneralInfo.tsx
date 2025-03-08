import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import {
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

interface TariffGeneralInfoProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TariffGeneralInfo: React.FC<TariffGeneralInfoProps> = ({ handleInputChange }) => {
  const { control, clearErrors } = useFormContext();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
              Основная информация
            </h3>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-4">
                {/* Поле "Название тарифа" */}
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Название обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Название тарифа"
                      placeholder="Введите название тарифа"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange({ target: { id: 'name', value: e } } as any);
                        clearErrors('name');
                      }}
                      onFocus={() => clearErrors('name')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Стоимость" */}
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'Стоимость обязательна' }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      type="number"
                      label="Стоимость тарифа"
                      placeholder="Введите стоимость"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange({ target: { id: 'price', value: e } } as any);
                        clearErrors('price');
                      }}
                      onFocus={() => clearErrors('price')}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Тип автомобиля" */}
                <Controller
                  name="vehicleType"
                  control={control}
                  rules={{ required: 'Тип автомобиля обязателен' }}
                  render={({ field, fieldState }) => (
                    <SelectSingle
                      label="Тип автомобиля"
                      value={
                        field.value
                          ? vehicleTypeOptions.find((option) => option.value === field.value) ||
                            null
                          : null
                      }
                      onChange={(option) => {
                        field.onChange(option?.value);
                        handleInputChange({
                          target: { id: 'vehicleType', value: option?.value },
                        } as any);
                        clearErrors('vehicleType');
                      }}
                      onFocus={() => clearErrors('vehicleType')}
                      options={vehicleTypeOptions}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Уровень обслуживания" */}
                <Controller
                  name="serviceLevel"
                  control={control}
                  rules={{ required: 'Уровень обслуживания обязателен' }}
                  render={({ field, fieldState }) => (
                    <SelectSingle
                      label="Уровень обслуживания"
                      value={
                        field.value
                          ? serviceLevelOptions.find((option) => option.value === field.value) ||
                            null
                          : null
                      }
                      onChange={(option) => {
                        field.onChange(option?.value);
                        handleInputChange({
                          target: { id: 'serviceLevel', value: option?.value },
                        } as any);
                        clearErrors('serviceLevel');
                      }}
                      onFocus={() => clearErrors('serviceLevel')}
                      options={serviceLevelOptions}
                      required
                      error={!!fieldState.error}
                      message={fieldState.error?.message}
                    />
                  )}
                />

                {/* Поле "Описание" */}
                <div className="col-span-2">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-bold ml-[10px] mb-2">Описание</p>
                        <textarea
                          className="w-full p-4 border border-gray-200 rounded-2xl min-h-[120px] text-sm font-medium focus:border-blue-500 outline-none hover:border-blue-500"
                          placeholder="Введите описание тарифа"
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleInputChange({
                              target: { id: 'description', value: e.target.value },
                            } as any);
                            clearErrors('description');
                          }}
                          onFocus={() => clearErrors('description')}
                        />
                        <div className="flex justify-end items-center h-5 mt-1 mx-3">
                          {fieldState.error && (
                            <p className="text-red-500 text-xs">{fieldState.error.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default TariffGeneralInfo;
