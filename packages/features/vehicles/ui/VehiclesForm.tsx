'use client';

import React from 'react';
import { FormProvider, Controller } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput, SelectSingle, CheckboxInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import {
  vehicleTypeOptions,
  colorOptions,
  serviceLevelOptions,
  ownershipOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { useVehiclesForm, VehicleData } from '@features/vehicles/hooks/useVehiclesCreateForm';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';
import { useAvailabilityUpdater } from '@features/vehicles/hooks/useAvailabilityUpdater';

interface VehiclesFormProps {
  mode: 'create' | 'edit';
  vehicleData?: VehicleData;
}

const VehiclesForm: React.FC<VehiclesFormProps> = ({ mode, vehicleData }) => {
  const {
    formMethods,
    handleSubmit,
    previewImage,
    drivers,
    onSelectDriver,
    onRemoveDriver,
    observerRef,
    scrollContainerRef,
    onSubmit,
  } = useVehiclesForm({ mode, vehicleData });
  const { control } = formMethods;

  //Хук для обновления доступности (используется в режиме редактирования)
  const { updateAvailability, loading: updatingAvailability } = useAvailabilityUpdater();

  //Опции для селектора доступности (режим edit)
  const availabilityOptions = [
    { label: 'Доступен', value: true },
    { label: 'Не доступен', value: false },
  ];

  //Обработчик изменения доступности для edit-режима
  const handleAvailabilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === 'true';
    if (vehicleData?.uuid) {
      await updateAvailability(vehicleData.uuid, newValue);
      //Обновляем локальное значение формы, если необходимо
      formMethods.setValue('isAvailable', newValue);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/*Заголовок формы */}
        {mode === 'edit' ? (
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">
              Редактирование автомобиля {vehicleData?.brand} {vehicleData?.model}
            </h1>
            <select
              value={formMethods.watch('isAvailable') ? 'true' : 'false'}
              onChange={handleAvailabilityChange}
              disabled={updatingAvailability}
              className="bg-[#2A3037] rounded-lg text-white p-4"
            >
              {availabilityOptions.map((option) => (
                <option key={option.label} value={option.value.toString()}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">Создание автомобиля</h1>
        )}

        <div className="flex flex-row bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {/*Левая колонка – поля формы и секция водителей */}
          <div className="w-2/3 pr-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {/*Тип автомобиля */}
              <Controller
                name="vehicleType"
                control={control}
                rules={{ required: 'Тип автомобиля обязателен' }}
                render={({ field, fieldState }) => (
                  <SelectSingle
                    label="Тип автомобиля:"
                    {...field}
                    options={vehicleTypeOptions}
                    value={
                      vehicleTypeOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Марка */}
              <Controller
                name="brand"
                control={control}
                rules={{ required: 'Марка обязательна' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Марка:"
                    placeholder="Введите марку автомобиля"
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Модель */}
              <Controller
                name="model"
                control={control}
                rules={{ required: 'Модель обязательна' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Модель:"
                    placeholder="Введите модель автомобиля"
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Год выпуска */}
              <Controller
                name="year"
                control={control}
                rules={{ required: 'Год выпуска обязателен' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Год выпуска:"
                    type="date"
                    placeholder="Выберите год выпуска"
                    value={field.value ? formatDate(field.value) : ''}
                    onChange={(value) => field.onChange(value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Цвет автомобиля */}
              <Controller
                name="color"
                control={control}
                rules={{ required: 'Цвет обязателен' }}
                render={({ field, fieldState }) => (
                  <SelectSingle
                    label="Цвет:"
                    {...field}
                    options={colorOptions}
                    value={colorOptions.find((option) => option.value === field.value) || null}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Номерной знак */}
              <Controller
                name="plateNumber"
                control={control}
                rules={{ required: 'Номерной знак обязателен' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Номерной знак:"
                    placeholder="Введите номерной знак"
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Уровень сервиса */}
              <Controller
                name="serviceLevels"
                control={control}
                rules={{ required: 'Уровень сервиса обязателен' }}
                render={({ field, fieldState }) => (
                  <SelectSingle
                    label="Уровень сервиса:"
                    {...field}
                    options={serviceLevelOptions}
                    value={
                      serviceLevelOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Владение */}
              <Controller
                name="ownership"
                control={control}
                rules={{ required: 'Владение обязательно' }}
                render={({ field, fieldState }) => (
                  <SelectSingle
                    label="Владение:"
                    {...field}
                    options={ownershipOptions}
                    value={ownershipOptions.find((option) => option.value === field.value) || null}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Чекбокс доступности для режима создания (create) – располагается после поля "Владение" */}
              {mode === 'create' && (
                <Controller
                  name="isAvailable"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2 col-span-2">
                      <CheckboxInput
                        label="Автомобиль доступен"
                        checked={field.value || false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(e.target.checked)
                        }
                      />
                    </div>
                  )}
                />
              )}
            </div>

            {/*Секция водителей */}
            <div className="mt-6 flex gap-4">
              {/*Левая колонка: список доступных водителей */}
              <div className="w-1/2">
                <label className="block mb-2 font-medium">Доступные водители:</label>
                <div
                  ref={scrollContainerRef}
                  className="max-h-40 h-40 overflow-y-auto border rounded p-2"
                >
                  {drivers.map((driver) => (
                    <div
                      key={driver.uuid}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => onSelectDriver(driver)}
                    >
                      {driver.fullName}
                    </div>
                  ))}
                  {/*Sentinel-элемент для бесконечной прокрутки */}
                  <div ref={observerRef} className="p-2 text-center" />
                </div>
              </div>

              {/*Правая колонка: выбранные водители */}
              <div className="w-1/2">
                <label className="block mb-2 font-medium">Выбранные водители:</label>
                <div className="max-h-40 h-40 overflow-y-auto border rounded p-2">
                  {formMethods.watch('vehicleDrivers')?.length > 0 ? (
                    formMethods.watch('vehicleDrivers').map((assignment) => (
                      <div
                        key={assignment.driver.uuid}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <span>{assignment.driver.fullName}</span>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => onRemoveDriver(assignment.driver.uuid)}
                        >
                          Удалить
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Нет выбранных водителей</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/*Правая колонка – загрузка изображения */}
          <div className="w-1/3 flex flex-col items-center justify-start">
            <Controller
              name="photoImage"
              control={control}
              render={({ field, fieldState }) => (
                <ImageUploadWithCrop
                  label="Фото автомобиля:"
                  initialSrc={previewImage || undefined}
                  onChange={(value) => field.onChange(value)}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
        </div>

        {/*Кнопка отправки */}
        <div className="flex justify-end">
          <IButton type="submit" className="bg-[#2A3037] rounded-lg text-white p-4">
            {mode === 'create' ? 'Создать автомобиль' : 'Сохранить изменения'}
          </IButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default VehiclesForm;
