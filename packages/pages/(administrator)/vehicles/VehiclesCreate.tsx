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
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
import { IButton } from '@shared/components/ui/buttons';

interface FormData extends Omit<CreateVehicleData, 'serviceLevels' | 'driverIds' | 'year'> {
  serviceLevels: ServiceLevels | undefined;
  driverIds: string[];
  year: Date | null;
  photoRegistrationCertificate: string | null;
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
      photoRegistrationCertificate: '',
    },
  });
  const { control, handleSubmit } = methods;
  const router = useRouter();

  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [message] = useState('');

  useEffect(() => {
    fetch('/api/users?role=Driver&include=driverProfile')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch drivers');
        return response.json();
      })
      .then((data) => setDrivers(data.data.users))
      .catch((error) => {
        console.error('Error fetching drivers:', error);
        showToast.error('Failed to fetch drivers.');
      });
  }, []);

  const onSubmit = async (formData: FormData) => {
    const transformedData: CreateVehicleData = {
      vehicleType: formData.vehicleType as VehicleType,
      brand: formData.brand,
      model: formData.model,
      year: formData.year ? new Date(`${formData.year}-01-01`) : null,
      color: formData.color as Color,
      plateNumber: formData.plateNumber,
      isAvailable: formData.isAvailable,
      photoPath: formData.photoPath,
      serviceLevels: formData.serviceLevels as ServiceLevels,
      driverIds: formData.driverIds,
      photoRegistrationCertificate: formData.photoRegistrationCertificate,
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
        const errorData = await response.json();
        if (errorData.error?.message && errorData.error?.fullName) {
          showToast.error(`${errorData.error.message} ${errorData.error.fullName}`);
        } else if (errorData.error?.message) {
          showToast.error(errorData.error.message);
        } else if (errorData.message) {
          showToast.error(errorData.message);
        } else {
          showToast.error(`Error creating vehicle: ${response.statusText}`);
        }
        return;
      }

      const result = await response.json();
      if (result && result.uuid) {
        showToast.success('Vehicle created successfully');
        router.push(`/transfer-services/detail/${result.uuid}`);
      } else {
        showToast.error('Failed to redirect to vehicle details page');
      }
    } catch (error) {
      showToast.error(`Error creating vehicle: ${(error as Error).message}`);
      console.error('Submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6 justify-center">
        <div>
          <h1 className="text-2xl font-bold mb-6">Create New Vehicle</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 rounded-lg shadow-md border border-gray-200"
          >
            {/*... other form fields ... */}

            {/*Vehicle Type */}
            <div className="form-group">
              <Controller
                name="vehicleType"
                control={control}
                rules={{ required: 'Vehicle type is required' }}
                render={({ field }) => (
                  <SelectSingle
                    label="Тип транспортного средства:"
                    classNameLabel="block text-4 font-medium text-gray-500 mb-2"
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
                    label="Бренд:"
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
                    label="Модель:"
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
              <Controller
                name="year"
                control={control}
                rules={{ required: 'Year is required' }}
                render={({ field, fieldState }) => (
                  <DateInput
                    label="Год:"
                    selectedDate={field.value}
                    onChange={(date) => field.onChange(date)}
                    placeholder="Select year"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            {/*Color */}
            <div className="form-group">
              <Controller
                name="color"
                control={control}
                rules={{ required: 'Color is required' }}
                render={({ field }) => (
                  <SelectSingle
                    label="Цвет:"
                    classNameLabel="block text-4 font-medium text-gray-500 mb-2"
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
                    label="Номер пластины:"
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
              <label className="block text-4 font-medium text-gray-500 mb-2">Доступность:</label>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <CheckboxInput
                    label="Available for booking"
                    checked={field.value}
                    onChange={field.onChange}
                    className="text-4 text-[#989898] font-extrabold"
                  />
                )}
              />
            </div>

            {/*Drivers */}
            <div className="form-group">
              <Controller
                name="driverIds"
                control={control}
                render={({ field }) => (
                  <SelectMultiple
                    label="Назначьте водителя:"
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
              <Controller
                name="serviceLevels"
                control={control}
                rules={{ required: 'Service level is required' }}
                render={({ field }) => (
                  <SelectSingle
                    label="Уровень обслуживания:"
                    classNameLabel="block text-4 font-medium text-gray-500 mb-2"
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

            {/*Photo Upload */}
            <div className=" flex items-start justify-center">
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

            {/*Photo Registration Certificate Upload */}
            <div className="flex items-start justify-center">
              <Controller
                name="photoRegistrationCertificate"
                control={control}
                render={({ field, fieldState }) => (
                  <ImageUpload
                    {...field}
                    value={field.value ?? ''}
                    label="Vehicle Registration Certificate Photo"
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </div>

            <IButton
              type="submit"
              className="bg-[#2A3037] rounded-[8px] font-inter font-normal text-[17px] leading-[20.57px] p-[10px] text-white h-fit mt-[22px]"
            >
              Создать автомобиль
            </IButton>
          </form>
        </div>
        {message && (
          <div className="mt-4 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
            {message}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default VehiclesCreate;
