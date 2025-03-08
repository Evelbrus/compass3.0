import React from 'react';
import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  AdditionalService,
  ServiceLevels,
  Tariff,
  TariffOnService,
  VehicleType,
} from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';

export interface TariffFormData
  extends Omit<Tariff, 'clientTypes' | 'vehicleType' | 'serviceLevel' | 'createdAt' | 'updatedAt'> {
  vehicleType: VehicleType | undefined;
  serviceLevel: ServiceLevels | undefined;
  tariffAdditionalServices: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
}

interface UseTariffFormProps {
  tariffData?: Tariff & { tariffAdditionalServices: TariffOnService[] };
}

export const useTariffCreateForm = ({ tariffData }: UseTariffFormProps) => {
  // Инициализируем форму
  const formMethods: UseFormReturn<TariffFormData> = useForm<TariffFormData>({
    mode: 'onChange',
    defaultValues: tariffData,
  });

  const { watch, setValue } = formMethods;

  // Состояния для модальных окон
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Состояния для дополнительных услуг
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Проверка наличия дополнительных услуг
  const hasAdditionalServices = (watch('tariffAdditionalServices')?.length || 0) > 0;

  useEffect(() => {
    // Загрузка дополнительных услуг при монтировании компонента
    const fetchAdditionalServices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          '/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc',
        );
        if (!response.ok) {
          throw new Error('Failed to fetch additional services');
        }
        const data = await response.json();
        setAdditionalServices(data.data.additionalServices);
      } catch (error) {
        console.error('Ошибка при загрузке дополнительных услуг:', error);
        showToast.error('Не удалось загрузить список дополнительных услуг');
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalServices();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setValue(
      id as any,
      type === 'number' ? (value ? Number(value) : 0) : type === 'checkbox' ? checked : value,
      { shouldValidate: true },
    );
  };

  const handleAddAdditionalService = (updatedService: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }) => {
    const currentServices = watch('tariffAdditionalServices') || [];
    const existingServiceIndex = currentServices.findIndex(
      (service) => service.serviceUuid === updatedService.serviceUuid,
    );

    if (existingServiceIndex !== -1) {
      const updatedServices = [...currentServices];
      updatedServices[existingServiceIndex] = updatedService;
      setValue('tariffAdditionalServices', updatedServices, { shouldValidate: true });
    } else {
      setValue('tariffAdditionalServices', [...currentServices, updatedService], {
        shouldValidate: true,
      });
    }
  };

  const handleRemoveAdditionalService = (serviceUuid: string) => {
    const currentServices = watch('tariffAdditionalServices') || [];
    setValue(
      'tariffAdditionalServices',
      currentServices.filter((service) => service.serviceUuid !== serviceUuid),
      { shouldValidate: true },
    );
  };

  const handleLocalChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    const currentServices = [...(watch('tariffAdditionalServices') || [])];

    if (currentServices[index]) {
      if (name === 'price') {
        currentServices[index].price = Number(value);
      } else if (name === 'isAvailable') {
        currentServices[index].isAvailable = checked;
      }

      setValue('tariffAdditionalServices', currentServices, { shouldValidate: true });
    }
  };

  const handleFreeWaitTimeChange = (value: string | number | bigint | null) => {
    const numberValue = Number(value);
    return numberValue <= 60 ? numberValue : 60;
  };

  // Перейти к выбору услуг
  const handleGoToServicesSelection = () => {
    setShowWarningModal(false);
  };

  return {
    formMethods,
    additionalServices,
    loading,
    showWarningModal,
    setShowWarningModal,
    handleInputChange,
    handleAddAdditionalService,
    handleRemoveAdditionalService,
    handleLocalChange,
    handleFreeWaitTimeChange,
    hasAdditionalServices,
    handleGoToServicesSelection,
  };
};

export default useTariffCreateForm;
