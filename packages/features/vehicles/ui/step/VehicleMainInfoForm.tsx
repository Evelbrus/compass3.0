import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, SelectSingle, CheckboxInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import {
  vehicleTypeOptions,
  colorOptions,
  serviceLevelOptions,
  ownershipOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { VehicleData } from '@features/vehicles/hooks/create';

type VehicleMainInfoFormProps = {
  previewImage: string | null;
};

export const VehicleMainInfoForm: React.FC<VehicleMainInfoFormProps> = ({ previewImage }) => {
  const { control, clearErrors } = useFormContext<VehicleData>();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="flex flex-row border-b border-gray-100">
            {/* Левая часть - информация об автомобиле */}
            <div className="w-2/3 border-r border-gray-100">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
                  Информация об автомобиле
                </h3>
                <div className="p-6">
                  {/* Тип автомобиля и класс обслуживания */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="vehicleType"
                      control={control}
                      rules={{ required: 'Тип автомобиля обязателен' }}
                      render={({ field, fieldState }) => (
                        <SelectSingle
                          label="Тип автомобиля"
                          options={vehicleTypeOptions}
                          value={
                            vehicleTypeOptions.find((option) => option.value === field.value) ||
                            null
                          }
                          onChange={(selectedOption) => {
                            clearErrors('vehicleType');
                            field.onChange(selectedOption?.value);
                          }}
                          onFocus={() => clearErrors('vehicleType')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="serviceLevels"
                      control={control}
                      rules={{ required: 'Уровень сервиса обязателен' }}
                      render={({ field, fieldState }) => (
                        <SelectSingle
                          label="Класс обслуживания"
                          options={serviceLevelOptions}
                          value={
                            serviceLevelOptions.find((option) => option.value === field.value) ||
                            null
                          }
                          onChange={(selectedOption) => {
                            clearErrors('serviceLevels');
                            field.onChange(selectedOption?.value);
                          }}
                          onFocus={() => clearErrors('serviceLevels')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Марка и модель */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="brand"
                      control={control}
                      rules={{ required: 'Марка обязательна' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Марка автомобиля"
                          placeholder="Например: Mercedes-Benz"
                          type="text"
                          value={field.value || ''}
                          onChange={(newValue) => {
                            clearErrors('brand');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('brand')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="model"
                      control={control}
                      rules={{ required: 'Модель обязательна' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Модель автомобиля"
                          placeholder="Например: S-Class"
                          type="text"
                          value={field.value || ''}
                          onChange={(newValue) => {
                            clearErrors('model');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('model')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Год выпуска и цвет */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="year"
                      control={control}
                      rules={{ required: 'Год выпуска обязателен' }}
                      render={({ field, fieldState }) => {
                        const [inputValue, setInputValue] = React.useState(
                          field.value ? new Date(field.value).getFullYear().toString() : '',
                        );

                        return (
                          <TextInput
                            label="Год выпуска"
                            type="text"
                            placeholder="Введите год, например: 2023"
                            value={inputValue}
                            onChange={(value: string | number | null) => {
                              const sanitizedValue = value
                                ? value.toString().replace(/\D/g, '').slice(0, 4)
                                : '';
                              setInputValue(sanitizedValue);
                              if (sanitizedValue.length === 4) {
                                field.onChange(`${sanitizedValue}-01-01T00:00:00.000Z`);
                                clearErrors('year');
                              } else {
                                field.onChange(null);
                              }
                            }}
                            onFocus={() => clearErrors('year')}
                            required
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            mode="createAutoDate"
                          />
                        );
                      }}
                    />
                    <Controller
                      name="color"
                      control={control}
                      rules={{ required: 'Цвет обязателен' }}
                      render={({ field, fieldState }) => (
                        <SelectSingle
                          label="Цвет автомобиля"
                          options={colorOptions}
                          value={
                            colorOptions.find((option) => option.value === field.value) || null
                          }
                          onChange={(selectedOption) => {
                            clearErrors('color');
                            field.onChange(selectedOption?.value);
                          }}
                          onFocus={() => clearErrors('color')}
                          isSearchable={true}
                          searchPlaceholder="Поиск цвета..."
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Регистрационный номер и тип владения */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="plateNumber"
                      control={control}
                      rules={{ required: 'Номерной знак обязателен' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Регистрационный номер"
                          placeholder="Например: А123ВС777"
                          type="text"
                          value={field.value || ''}
                          onChange={(newValue) => {
                            clearErrors('plateNumber');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('plateNumber')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="ownership"
                      control={control}
                      rules={{ required: 'Владение обязательно' }}
                      render={({ field, fieldState }) => (
                        <SelectSingle
                          label="Тип владения"
                          options={ownershipOptions}
                          value={
                            ownershipOptions.find((option) => option.value === field.value) || null
                          }
                          onChange={(selectedOption) => {
                            clearErrors('ownership');
                            field.onChange(selectedOption?.value);
                          }}
                          onFocus={() => clearErrors('ownership')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Доступность автомобиля */}
                  <div className="mt-4">
                    <Controller
                      name="isAvailable"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => (
                        <CheckboxInput
                          label="Автомобиль доступен для бронирования"
                          checked={field.value === undefined ? true : field.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(e.target.checked)
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - фото автомобиля */}
            <div className="w-1/3 bg-gray-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Фотография автомобиля</h3>
              <div className="flex flex-col items-center">
                <AnimatedComponent duration={500} className="w-full">
                  <Controller
                    name="photoImage"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                        <ImageUploadWithCrop
                          initialImage={previewImage || undefined}
                          onChange={(value) => {
                            clearErrors('photoImage');
                            field.onChange(value);
                          }}
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message || ''}
                        />
                      </div>
                    )}
                  />
                </AnimatedComponent>
                <p className="text-xs text-gray-500 mt-3">
                  Рекомендуемый размер: не менее 800x600 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};
