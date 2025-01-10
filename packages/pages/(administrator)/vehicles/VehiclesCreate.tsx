'use client';

import React, { useState, useEffect } from 'react';
import { User, DriverProfile, VehicleType, Color, ServiceLevels } from '@prisma/client';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  ImageUpload,
  TextInput,
  SelectSingle,
  SelectMultiple,
  CheckboxInput,
  DateInput,
} from '@shared/components/ui/inputs';
import { validateLength, validateNoSpecialChars } from '@shared/utils/validations';
import {
  colorOptions,
  vehicleTypeOptions,
  serviceLevelOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

interface FormData extends Omit<CreateVehicleData, 'serviceLevels' | 'driverIds'> {
  serviceLevels: ServiceLevels | undefined;
  driverIds: string[];
}

const VehiclesCreate: React.FC = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      vehicleType: undefined,
      brand: '',
      model: '',
      year: null,
      color: undefined,
      plateNumber: '',
      isAvailable: false,
      driverIds: [],
      serviceLevels: undefined,
      photoPath: '',
    },
  });
  const { control, handleSubmit, setValue } = methods;

  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/users?role=Driver&include=driverProfile')
      .then((response) => response.json())
      .then((data) => setDrivers(data.data.users))
      .catch((error) => console.error('Error fetching drivers:', error));
  }, []);

  const onSubmit = async (data: FormData) => {
    //Преобразование значений перечислений в строки
    const transformedData: CreateVehicleData = {
      vehicleType: data.vehicleType as VehicleType,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color as Color,
      plateNumber: data.plateNumber,
      isAvailable: data.isAvailable,
      photoPath: data.photoPath,
      serviceLevels: data.serviceLevels as ServiceLevels,
      driverIds: data.driverIds,
    };

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Vehicle created successfully: ${result.brand} ${result.model}`);
    } catch (error) {
      setMessage(`Error creating vehicle: ${(error as Error).message}`);
      console.error('There was an error creating the vehicle!', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-row justify-center">
        <div className="w-2/3 pr-4">
          <h1>Create Vehicle</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="vehicleType">Vehicle Type:</label>
              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={vehicleTypeOptions}
                    value={
                      vehicleTypeOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="brand">Brand:</label>
              <Controller
                name="brand"
                control={control}
                rules={{
                  validate: (value) =>
                    validateLength(2, 50)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    requiredStar={true}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="model">Model:</label>
              <Controller
                name="model"
                control={control}
                rules={{
                  validate: (value) =>
                    validateLength(2, 50)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    requiredStar={true}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="year">Year:</label>
              <Controller
                name="year"
                control={control}
                render={({ field, fieldState }) => (
                  <DateInput
                    selectedDate={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    label="Year"
                    placeholder="Выберите год"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                    classNameInput="font-extrabold w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
                    maxDate={new Date()}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="color">Color:</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={colorOptions}
                    value={colorOptions.find((option) => option.value === field.value) || null}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="plateNumber">Plate Number:</label>
              <Controller
                name="plateNumber"
                control={control}
                rules={{
                  validate: (value) =>
                    validateLength(2, 50)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    requiredStar={true}
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="isAvailable">Is Available:</label>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <CheckboxInput
                    label="Is Available"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="drivers">Drivers:</label>
              <Controller
                name="driverIds"
                control={control}
                render={({ field }) => (
                  <SelectMultiple
                    {...field}
                    options={drivers.map((driver) => ({
                      value: driver.driverProfile?.uuid || '',
                      label: driver.fullName,
                    }))}
                    value={drivers
                      .filter((driver) =>
                        (field.value || []).includes(driver.driverProfile?.uuid || ''),
                      )
                      .map((driver) => ({
                        value: driver.driverProfile?.uuid || '',
                        label: driver.fullName,
                      }))}
                    onChange={(selectedOptions) =>
                      field.onChange(selectedOptions.map((option) => option.value))
                    }
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="serviceLevels">Service Levels:</label>
              <Controller
                name="serviceLevels"
                control={control}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={serviceLevelOptions}
                    value={
                      serviceLevelOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                  />
                )}
              />
            </div>
            <button type="submit">Create Vehicle</button>
          </form>
          {message && <p>{message}</p>}
        </div>
        <div className="w-1/3 flex items-start justify-center p-6">
          <Controller
            name="photoPath"
            control={control}
            render={({ field, fieldState }) => (
              <ImageUpload
                {...field}
                value={field.value ?? ''}
                label="Vehicle Photo"
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default VehiclesCreate;
