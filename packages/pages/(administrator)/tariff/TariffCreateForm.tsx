'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AdditionalService, ServiceLevels, VehicleType } from '@prisma/client';
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import TariffCreateStep1 from './step-create/TariffCreateStep1';
import TariffCreateStep2 from './step-create/TariffCreateStep2';
import TariffCreateStep3 from './step-create/TariffCreateStep3';
import { steps } from './constants/_tariff';

interface FormData extends Omit<CreateTariffData, 'clientTypes' | 'vehicleType' | 'serviceLevel'> {
  vehicleType: VehicleType | undefined;
  serviceLevel: ServiceLevels | undefined;
  tariffAdditionalServices: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
}

const TariffCreateForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    vehicleType: undefined,
    description: '',
    price: 0,
    additionalPointPrice: 0,
    freeWaitTimeBishkek: 0,
    pricePerMinuteAfterBishkek: 0,
    freeWaitTimeAirport: 0,
    pricePerMinuteAfterAirport: 0,
    serviceLevel: undefined,
    tariffAdditionalServices: [],
  });

  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    //Fetch additional services
    fetch('/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc')
      .then((response) => response.json())
      .then((data) => {
        const services = data.data.additionalServices;
        setAdditionalServices(services);
        //Initialize tariffAdditionalServices from fetched additional services
        setFormData((prevData) => ({
          ...prevData,
          tariffAdditionalServices: services.map((service) => ({
            serviceUuid: service.uuid,
            price: 0, //You can set a default price here if needed
            isAvailable: false,
          })),
        }));
      })
      .catch((error) => console.error('Error fetching additional services:', error));
  }, []);

  //Handle form input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === 'number' ? (value ? Number(value) : 0) : type === 'checkbox' ? checked : value,
    }));
  };

  //Handle additional services input changes
  const handleAdditionalServicesChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = event.target;
    const newAdditionalServices = [...formData.tariffAdditionalServices];
    newAdditionalServices[index] = {
      ...newAdditionalServices[index],
      [name]: name === 'isAvailable' ? checked : Number(value),
    };

    setFormData((prevData) => ({
      ...prevData,
      tariffAdditionalServices: newAdditionalServices,
    }));
  };

  //Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    console.log('Form data:', formData);

    try {
      const response = await fetch('/api/tariffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Tariff created successfully: ${result.name}`);
    } catch (error) {
      setMessage(`Error creating tariff: ${(error as Error).message}`);
      console.error('There was an error creating the tariff!', error);
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
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Tariff</h1>
      <section className="flex flex-col justify-center bg-white rounded-md">
        <form
          onSubmit={handleSubmit}
          id="tariff-create-form"
          className="grid grid-cols-1 gap-x-8 gap-y-4 p-6"
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
          {step === 1 && (
            <TariffCreateStep1
              handleInputChange={handleInputChange}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {step === 2 && (
            <TariffCreateStep2
              handleInputChange={handleInputChange}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {step === 3 && (
            <TariffCreateStep3
              formData={formData}
              additionalServices={additionalServices}
              handleAdditionalServicesChange={handleAdditionalServicesChange}
            />
          )}
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
              form="tariff-create-form"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Создать тариф
            </IButton>
          )}
        </div>
      </section>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TariffCreateForm;
