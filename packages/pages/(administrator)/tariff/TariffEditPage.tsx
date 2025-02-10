'use client';

import { ServiceLevels, VehicleType } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { DetailTariffData, EditTariffData } from '@shared/prisma/interface/tariff/interface';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { steps } from './constants/_tariff';
import TariffEditStep1 from './step-edit/TariffEditStep1';
import TariffEditStep2 from './step-edit/TariffEditStep2';
import TariffEditStep3 from './step-edit/TariffEditStep3';

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

  const [step, setStep] = useState(1);
  const { handleSubmit } = methods;
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

  const handleBack = () => {
    if (step === 1) {
      router.push('/tariff-management');
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <FormProvider {...methods}>
      <section>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Tariff</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          id="tariff-edit-form"
          className="grid grid-cols-1 gap-4 p-6 bg-white shadow-md rounded-lg border border-gray-200"
        >
          <div className="flex justify-start gap-2 mb-4">
            {steps.map((label, index) => (
              <div
                key={index}
                className={`p-2 border-2 ${
                  step === index + 1
                    ? 'border-t-0 border-x-0 border-b-[#2A3037]'
                    : 'border-t-0 border-x-0 border-b-white'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          {step === 1 && <TariffEditStep1 />}
          {step === 2 && <TariffEditStep3 data={data} />}
          {step === 3 && <TariffEditStep2 />}
        </form>
        <div className={'w-full flex justify-end gap-4 p-6'}>
          <IButton
            type="button"
            className="w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
            textClassName="w-full text-center justify-center"
            onClick={handleBack}
          >
            Назад
          </IButton>
          {step < 3 && (
            <IButton
              type="button"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
              onClick={handleNext}
            >
              Далее
            </IButton>
          )}
          {step === 3 && (
            <IButton
              type="submit"
              form="tariff-edit-form"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Сохранить изменения
            </IButton>
          )}
        </div>
      </section>
    </FormProvider>
  );
};

export default TariffEdit;
