import { useState, useEffect, ChangeEvent } from 'react';
import { AdditionalService } from '@prisma/client';
import { FormData as TariffFormData } from '../types/tariff-types';

export interface UseTariffFormProps {
  mode: 'create' | 'edit';
  initialData?: TariffFormData;
}

export const useTariffForm = ({ mode, initialData }: UseTariffFormProps) => {
  const [formData, setFormData] = useState<TariffFormData>({
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
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<
    { serviceUuid: string; price: number; isAvailable: boolean }[]
  >([]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    }
  }, [mode, initialData]);

  useEffect(() => {
    fetch('/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc')
      .then((response) => response.json())
      .then((data) => {
        const services = data.data.additionalServices;
        setAdditionalServices(services);
      })
      .catch((error) => console.error('Ошибка при загрузке дополнительных услуг:', error));
  }, []);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      tariffAdditionalServices: selectedAdditionalServices,
    }));
  }, [selectedAdditionalServices]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === 'number' ? (value ? Number(value) : 0) : type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAdditionalService = (updatedService: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }) => {
    setFormData((prev) => {
      const existingServiceIndex = prev.tariffAdditionalServices.findIndex(
        (service) => service.serviceUuid === updatedService.serviceUuid,
      );

      if (existingServiceIndex !== -1) {
        const updatedServices = [...prev.tariffAdditionalServices];
        updatedServices[existingServiceIndex] = updatedService;
        return { ...prev, tariffAdditionalServices: updatedServices };
      } else {
        return {
          ...prev,
          tariffAdditionalServices: [...prev.tariffAdditionalServices, updatedService],
        };
      }
    });
  };

  const handleRemoveAdditionalService = (serviceUuid: string) => {
    setFormData((prev) => ({
      ...prev,
      tariffAdditionalServices: prev.tariffAdditionalServices.filter(
        (service) => service.serviceUuid !== serviceUuid,
      ),
    }));
  };

  const handleLocalChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;

    const updatedServices = [...formData.tariffAdditionalServices];

    if (name === 'price') {
      updatedServices[index].price = Number(value);
    } else if (name === 'isAvailable') {
      updatedServices[index].isAvailable = checked;
    }

    handleAddAdditionalService(updatedServices[index]);
  };

  const handleFreeWaitTimeChange = (value: string | number | bigint | null) => {
    const numberValue = Number(value);
    return numberValue <= 60 ? numberValue : 60;
  };

  return {
    formData,
    setFormData,
    additionalServices,
    selectedAdditionalServices,
    setSelectedAdditionalServices,
    handleInputChange,
    handleAddAdditionalService,
    handleRemoveAdditionalService,
    handleLocalChange,
    handleFreeWaitTimeChange,
  };
};
