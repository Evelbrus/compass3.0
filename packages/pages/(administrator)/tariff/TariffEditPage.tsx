'use client';

import { ServiceLevels, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { CheckboxInput, SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { DetailTariffData, EditTariffData } from '@shared/prisma/interface/tariff/interface';
import { useRouter } from 'next/navigation';
import {
  vehicleTypeOptions,
  serviceLevelOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';

interface TariffsEditProps {
  data: DetailTariffData;
}

const TariffEdit: React.FC<TariffsEditProps> = ({ data }) => {
  const methods = useForm<EditTariffData>({
    defaultValues: {
      name: data.name ?? '',
      description: data.description ?? '',
      price: data.price ?? 0,
      additionalPointPrice: data.additionalPointPrice ?? 0,
      vehicleType: (data.vehicleType as VehicleType) ?? 'DEFAULT_VEHICLE_TYPE',
      serviceLevel: (data.serviceLevel as ServiceLevels) ?? 'DEFAULT_SERVICE_LEVEL',
      freeWaitTimeAirport: data.freeWaitTimeAirport ?? 0,
      freeWaitTimeBishkek: data.freeWaitTimeBishkek ?? 0,
      pricePerMinuteAfterAirport: data.pricePerMinuteAfterAirport ?? 0,
      pricePerMinuteAfterBishkek: data.pricePerMinuteAfterBishkek ?? 0,
      tariffIds: data.tariffAdditionalServices?.map((service) => service.service.uuid) ?? [],
      tariffAdditionalServices:
        data.tariffAdditionalServices?.map((service) => ({
          serviceUuid: service.service.uuid ?? '',
          price: service.price ?? 0,
          isAvailable: service.isAvailable ?? false,
        })) ?? [],
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const { control, handleSubmit } = methods;
  const router = useRouter();

  const onSubmit = async (formData: EditTariffData) => {
    try {
      const response = await fetch(`/api/tariffs/${data.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        showToast.error('Error updating tariff');
        return;
      }

      const res = await response.json();
      if (res && res.uuid) {
        showToast.success('Tariff updated successfully');

        router.push(`/tariff-management/`);
      } else {
        showToast.error('Failed to redirect to tariff details page');
      }
    } catch (error) {
      showToast.error(`Error updating tariff: ${(error as Error).message}`);
    }
  };
  return (
    <FormProvider {...methods}>
      <section>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Tariff</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-6 bg-white shadow-md rounded-lg border border-gray-200"
        >
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
          <div className="rounded-lg mb-4 bg-white border border-gray-300">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex justify-between items-center p-4 rounded-t-lg"
            >
              <h2 className="text-2xl font-bold text-gray-700">Additional Services</h2>
              <span
                className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
              >
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out ${
                isOpen ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="p-4 bg-white border-t border-gray-300">
                {data.tariffAdditionalServices.map((service, index) => (
                  <div key={service.service.uuid} className="flex items-center gap-[12px]">
                    <div>
                      <p className=" block text-4 font-medium text-gray-500 mb-2">
                        {service.service.name}
                      </p>
                      <Controller
                        name={`tariffAdditionalServices.${index}.price`}
                        control={control}
                        render={({ field }) => (
                          <TextInput {...field} placeholder="Enter price" type="number" />
                        )}
                      />
                    </div>
                    <Controller
                      name={`tariffAdditionalServices.${index}.isAvailable`}
                      control={control}
                      render={({ field }) => (
                        <CheckboxInput {...field} label="Available" checked={field.value} />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <IButton
            type="submit"
            className="bg-[#2A3037] rounded-[8px] font-inter font-normal text-[17px] leading-[20.57px] p-[10px] text-white h-fit mt-[22px]"
          >
            Save
          </IButton>
        </form>
      </section>
    </FormProvider>
  );
};

export default TariffEdit;
