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

interface FormData extends Omit<CreateVehicleData, 'serviceLevels' | 'driverIds' | 'year'> {
  serviceLevels: ServiceLevels | undefined;
  driverIds: string[];
  year: Date | null;
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
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch drivers');
        return response.json();
      })
      .then((data) => setDrivers(data.data.users))
      .catch((error) => console.error('Error fetching drivers:', error));
  }, []);

  const onSubmit = async (formData: FormData) => {
    const transformedData: CreateVehicleData = {
      vehicleType: formData.vehicleType as VehicleType,
      brand: formData.brand,
      model: formData.model,
      year: formData.year ? new Date(formData.year).getFullYear() : null,
      color: formData.color as Color,
      plateNumber: formData.plateNumber,
      isAvailable: formData.isAvailable,
      photoPath: formData.photoPath,
      serviceLevels: formData.serviceLevels as ServiceLevels,
      driverIds: formData.driverIds,
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setMessage(`Vehicle created successfully: ${result.brand} ${result.model}`);
      methods.reset();
    } catch (error) {
      setMessage(`Error creating vehicle: ${(error as Error).message}`);
      console.error('Submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-row justify-center">
        <div className="w-2/3 pr-4">
          <h1 className="text-2xl font-bold mb-6">Create New Vehicle</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/*Vehicle Type */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Vehicle Type</label>
              <Controller
                name="vehicleType"
                control={control}
                rules={{ required: 'Vehicle type is required' }}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={vehicleTypeOptions}
                    value={
                      vehicleTypeOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    placeholder="Select vehicle type"
                  />
                )}
              />
            </div>

            {/*Brand */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Brand</label>
              <Controller
                name="brand"
                control={control}
                rules={{
                  required: 'Brand is required',
                  validate: (value) =>
                    validateLength(2, 50)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    placeholder="Enter brand"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            {/*Model */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Model</label>
              <Controller
                name="model"
                control={control}
                rules={{
                  required: 'Model is required',
                  validate: (value) =>
                    validateLength(2, 50)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    placeholder="Enter model"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            {/*Year */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Year</label>
              <Controller
                name="year"
                control={control}
                rules={{ required: 'Year is required' }}
                render={({ field, fieldState }) => (
                  <DateInput
                    selectedDate={field.value}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select year"
                    showYearPicker
                    dateFormat="yyyy"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            {/*Color */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Color</label>
              <Controller
                name="color"
                control={control}
                rules={{ required: 'Color is required' }}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={colorOptions}
                    value={colorOptions.find((option) => option.value === field.value) || null}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    placeholder="Select color"
                  />
                )}
              />
            </div>

            {/*Plate Number */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Plate Number</label>
              <Controller
                name="plateNumber"
                control={control}
                rules={{
                  required: 'Plate number is required',
                  validate: (value) =>
                    validateLength(2, 20)(value) && validateNoSpecialChars(value),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    placeholder="Enter plate number"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            {/*Availability */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Availability</label>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <CheckboxInput
                    label="Available for booking"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/*Drivers */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Assign Drivers</label>
              <Controller
                name="driverIds"
                control={control}
                render={({ field }) => (
                  <SelectMultiple
                    {...field}
                    options={drivers.map((driver) => ({
                      value: driver.uuid,
                      label: driver.fullName,
                    }))}
                    value={drivers
                      .filter((driver) => (field.value || []).includes(driver.uuid))
                      .map((driver) => ({
                        value: driver.uuid,
                        label: driver.fullName,
                      }))}
                    onChange={(selectedOptions) =>
                      field.onChange(selectedOptions.map((option) => option.value))
                    }
                    placeholder="Select drivers"
                  />
                )}
              />
            </div>

            {/*Service Level */}
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Service Level</label>
              <Controller
                name="serviceLevels"
                control={control}
                rules={{ required: 'Service level is required' }}
                render={({ field }) => (
                  <SelectSingle
                    {...field}
                    options={serviceLevelOptions}
                    value={
                      serviceLevelOptions.find((option) => option.value === field.value) || null
                    }
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    placeholder="Select service level"
                  />
                )}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Vehicle
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
              {message}
            </div>
          )}
        </div>

        {/*Photo Upload */}
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
                onUpload={(url) => setValue('photoPath', url)}
              />
            )}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default VehiclesCreate;
