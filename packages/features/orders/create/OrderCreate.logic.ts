import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ServiceLevels, User, VehicleType } from '@prisma/client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { useErrorMessage } from '@features/orders/create/functions/useErrorMessage';
import { useNotifications } from '@features/orders/create/hooks';
import { cleanIntermediatePoints } from '@features/orders/create/helpers';
import { fetchClients } from '@features/orders/create/api/orderApi';
import { useOrderCreateDrivers } from './useOrderCreateDrivers';
import { useOrderCreateHandlers } from './useOrderCreateHandlers';
import { useOrderCreatePoints } from './useOrderCreatePoints';
import { useOrderCreateTariffs } from './useOrderCreateTariffs';

interface SelectedDriverInfo {
  uuid: string;
  fullName: string;
}

export const useOrderCreateLogic = () => {
  const [clients, setClients] = useState<User[]>([]);
  const { message, setErrorMessage } = useErrorMessage();

  const [searchDriver, setSearchDriver] = useState('');
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<SelectedDriverInfo | null>(null);

  //Инициализация useForm
  const formMethods = useForm<CreateOrderData>({
    mode: 'onBlur',
  });

  const { setValue, watch, formState, handleSubmit } = formMethods;

  const {
    drivers,
    total,
    page,
    perPage,
    changePage,
    changePerPage,
    isLoading,
    handleSearchDriver,
    setPage,
    handleDriverClick,
  } = useOrderCreateDrivers({ setErrorMessage, setSelectedDriverInfo });

  const { points, getAvailablePoints } = useOrderCreatePoints({ setErrorMessage });

  const { tariffs, updateTariffs } = useOrderCreateTariffs({
    setErrorMessage,
  });

  const {
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffChange,
    handleAdditionalServiceChangeCallback,
  } = useOrderCreateHandlers({
    setValue,
    watch,
    tariffs,
    points,
    setErrorMessage,
  });

  const { handleOrderSuccess, handleOrderError } = useNotifications({
    formData: watch(),
    message,
    setErrorMessage,
    setInitialFormData: () => {},
  });

  const vehicleTypes = Object.values(VehicleType);
  const serviceLevels = Object.values(ServiceLevels);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [clientsData] = await Promise.all([fetchClients()]);
        setClients(clientsData);
      } catch (error) {
        setErrorMessage(error, 'Error fetching initial data');
      }
    };

    fetchInitialData();
  }, [setErrorMessage]);

  const onSubmit = async (data: CreateOrderData) => {
    try {
      const cleanedIntermediatePoints = cleanIntermediatePoints(data.intermediatePoints || []);

      const orderData: CreateOrderData = {
        ...data,
        intermediatePoints: cleanedIntermediatePoints,
        selectedServices: selectedAdditionalServices,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      handleOrderSuccess(result);
    } catch (error) {
      handleOrderError(error);
    }
  };

  const handleAddIntermediatePoint = () => {
    const currentPoints = watch().intermediatePoints || [];
    setValue('intermediatePoints', [...currentPoints, '']);
  };

  const handleRemoveIntermediatePoint = (index: number) => {
    const currentPoints = watch().intermediatePoints || [];
    const updatedPoints = currentPoints.filter((_, i) => i !== index);
    setValue('intermediatePoints', updatedPoints);
  };

  const handleChangeIntermediatePoint = (index: number, value: string) => {
    const currentPoints = watch().intermediatePoints || [];
    const updatedPoints = currentPoints.map((point, i) => (i === index ? value : point));
    setValue('intermediatePoints', updatedPoints);
  };

  return {
    ...formMethods,
    clients,
    points,
    drivers,
    tariffs,
    message,
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    errors: formState.errors,
    vehicleTypes,
    serviceLevels,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffChange,
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
    handleAdditionalServiceChange: handleAdditionalServiceChangeCallback,
    getAvailablePoints,
    searchDriver,
    handleSearchDriver,
    page,
    perPage,
    total,
    changePage,
    changePerPage,
    isLoading,
    onSubmit,
    handleDriverClick,
    setSearchDriver,
    setPage,
    selectedDriverInfo,
    handleSubmit,
  };
};
