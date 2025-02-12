'use client';

import React, { useState, useEffect } from 'react';
import { VehicleType, Color, User, DriverProfile, ServiceLevels } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { DetailVehicleData, EditVehicleData } from '@shared/prisma/interface/vehicles/interface';
import {
  ImageUpload,
  TextInput,
  SelectSingle,
  SelectMultiple,
  CheckboxInput,
  DateInput,
} from '@shared/components/ui/inputs';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  colorOptions,
  vehicleTypeOptions,
  serviceLevelOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';

interface FormData extends Omit<EditVehicleData, 'serviceLevels' | 'driverIds' | 'year'> {
  serviceLevels: ServiceLevels | undefined;
  driverIds: string[];
  year: Date | null;
  photoRegistrationCertificate: string | null;
}

interface VehiclesEditProps {
  data: DetailVehicleData;
}

const VehiclesEdit: React.FC<VehiclesEditProps> = ({ data }) => {
  const methods = useForm<FormData>({
    defaultValues: {
      ...data,
      year: data.year ? new Date(data.year) : null,
      driverIds: data.vehicleDrivers.map((driver) => driver.driver.uuid),
      serviceLevels: data.serviceLevels as ServiceLevels,
      color: data.color as Color,
      vehicleType: data.vehicleType as VehicleType,
      photoPath: data.photoPath || undefined,
      photoRegistrationCertificate: data.photoRegistrationCertificate || undefined,
    },
  });
  const { control, handleSubmit } = methods;

  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    //Fetch drivers with role 'Driver'
    fetch('/api/users?role=Driver&include=driverProfile')
      .then((response) => response.json())
      .then((data) => setDrivers(data.data.users))
      .catch((error) => console.error('Error fetching drivers:', error));
  }, []);

  const onSubmit = async (formData: FormData) => {
    const transformedData: EditVehicleData = {
      vehicleType: formData.vehicleType as VehicleType,
      brand: formData.brand,
      model: formData.model,
      year: formData.year ? new Date(formData.year) : null,
      color: formData.color as Color,
      plateNumber: formData.plateNumber,
      isAvailable: formData.isAvailable,
      photoPath: formData.photoPath,
      serviceLevels: formData.serviceLevels as ServiceLevels,
      driverIds: formData.driverIds,
      photoRegistrationCertificate: formData.photoRegistrationCertificate,
    };

    try {
      const response = await fetch(`/api/vehicles/${data.uuid}`, {
        method: 'PUT',
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
        } else {
          showToast.error(`Error updating vehicle: ${response.statusText}`);
        }
        return;
      }

      const result = await response.json();
      if (result && result.uuid) {
        showToast.success('Vehicle updated successfully');
        router.push(`/transfer-services/detail/${result.uuid}`);
      } else {
        showToast.error('Failed to redirect to vehicle details page');
      }
    } catch (error) {
      showToast.error(`Error updating vehicle: ${(error as Error).message}`);
      console.error('Submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Vehicle</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-6 bg-white shadow-md rounded-lg border border-gray-200"
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
                  label="Vehicle Type"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
                  {...field}
                  options={vehicleTypeOptions}
                  value={vehicleTypeOptions.find((option) => option.value === field.value) || null}
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
              rules={{ required: 'Brand is required' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  placeholder="Enter brand"
                  label="Brand"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
                />
              )}
            />
          </div>

          {/*Model */}
          <div className="form-group">
            <Controller
              name="model"
              control={control}
              rules={{ required: 'Model is required' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  placeholder="Enter model"
                  label="Model"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
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
              render={({ field }) => (
                <DateInput
                  selectedDate={field.value}
                  onChange={(date) => field.onChange(date)}
                  placeholder="Select year"
                  label="Year"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
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
                  {...field}
                  options={colorOptions}
                  value={colorOptions.find((option) => option.value === field.value) || null}
                  onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                  placeholder="Select color"
                  label="Color"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
                />
              )}
            />
          </div>

          {/*Plate Number */}
          <div className="form-group">
            <Controller
              name="plateNumber"
              control={control}
              rules={{ required: 'Plate number is required' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  placeholder="Enter plate number"
                  label="Plate Number"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
                />
              )}
            />
          </div>

          {/*Availability */}
          <div className="form-group">
            <label className="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]">
              Availability
            </label>
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
              render={({ field }) =>
                drivers ? (
                  <SelectMultiple
                    label="Assign Drivers"
                    classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
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
                ) : (
                  <div>Loading...</div>
                )
              }
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
                  label="Service Level"
                  classNameLabel="mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
                  {...field}
                  options={serviceLevelOptions}
                  value={serviceLevelOptions.find((option) => option.value === field.value) || null}
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
              render={({ field }) => (
                <ImageUpload {...field} label="Vehicle Photo" value={field.value || undefined} />
              )}
            />
          </div>

          {/*Photo Registration Certificate Upload */}
          <div className="flex items-start justify-center">
            <Controller
              name="photoRegistrationCertificate"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  {...field}
                  label="Vehicle Registration Certificate Photo"
                  value={field.value || undefined}
                />
              )}
            />
          </div>

          <IButton
            type="submit"
            className="bg-[#2A3037] rounded-[8px] font-inter font-normal text-[17px] leading-[20.57px] p-[10px] text-white h-fit mt-[22px]"
          >
            Save
          </IButton>
        </form>
      </div>
      {message && (
        <div className="mt-4 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
          {message}
        </div>
      )}
    </FormProvider>
  );
};

export default VehiclesEdit;
