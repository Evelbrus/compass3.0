import React, { useState, useEffect, useCallback, FormEvent, useRef } from 'react';

import { ServiceLevels, User, VehicleType } from '@prisma/client';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import useDebounce from '@shared/utils/hooks/useDebounce';
import { useErrorMessage } from '@features/orders/create/functions/useErrorMessage';
import { useDrivers, useNotifications, usePoints, useTariffs } from '@features/orders/create/hooks';
import {
  calculateTotalPrice,
  cleanIntermediatePoints,
  handleAdditionalServiceChange,
} from '@features/orders/create/helpers';
import { fetchClients } from '@features/orders/create/api/orderApi';
import { useFormState } from '@features/orders/create/hooks/formState';

export const useOrderCreateLogic = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('');
  const [searchDriver, setSearchDriver] = useState<string>('');
  const debouncedSearchDriver = useDebounce(searchDriver, 300);
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);

  const { message, setErrorMessage } = useErrorMessage();
  const {
    formData,
    setFormData,
    handleChange,
    handleDriverSelect,
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
    setInitialFormData,
  } = useFormState();

  const { drivers, total, page, perPage, changePage, changePerPage, isLoading } = useDrivers({
    selectedServiceLevel,
    selectedVehicleType,
    searchDriver: debouncedSearchDriver,
    setErrorMessage,
  });

  const { points, getAvailablePoints } = usePoints({ setErrorMessage });

  const { tariffs, updateTariffs } = useTariffs({
    selectedServiceLevel: '',
    selectedVehicleType: '',
    setErrorMessage,
  });

  const { handleOrderSuccess, handleOrderError } = useNotifications({
    formData,
    message,
    setErrorMessage,
    setInitialFormData,
  });

  const vehicleTypes = Object.values(VehicleType);
  const serviceLevels = Object.values(ServiceLevels);

  const updatePrice = useCallback(() => {
    if (selectedTariff) {
      const newPrice = calculateTotalPrice({
        selectedTariff,
        selectedAdditionalServices,
        intermediatePoints: formData.intermediatePoints,
        arrivalPointUuid: formData.arrivalPoint,
        points,
      });
      setFormData((prev) => ({ ...prev, basePrice: newPrice }));
    }
  }, [
    selectedTariff,
    selectedAdditionalServices,
    formData.intermediatePoints,
    formData.arrivalPoint,
    points,
    setFormData,
  ]);

  useEffect(() => {
    updatePrice();
  }, [updatePrice]);

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

  const fetchTariffsRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    fetchTariffsRef.current = async () => {
      try {
        await updateTariffs();
      } catch (error) {
        setErrorMessage(error, 'Error fetching tariffs');
      }
    };
  }, [selectedServiceLevel, selectedVehicleType, updateTariffs, setErrorMessage]);

  useEffect(() => {
    const fetchTariffs = async () => {
      if (fetchTariffsRef.current) {
        await fetchTariffsRef.current();
      }
    };

    if (selectedServiceLevel || selectedVehicleType) {
      const debounceTimer = setTimeout(fetchTariffs, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [selectedServiceLevel, selectedVehicleType]);

  const handleSearchDriver = (value: string) => {
    setSearchDriver(value);
  };

  const handleVehicleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicleType(e.target.value);
  }, []);

  const handleServiceLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceLevel(e.target.value);
  }, []);

  useEffect(() => {
    if (selectedTariff && !tariffs.some((t) => t.uuid === selectedTariff.uuid)) {
      setSelectedTariff(null);
      setSelectedAdditionalServices([]);
      setFormData((prev) => ({
        ...prev,
        tariffUuid: '',
        basePrice: 0,
      }));
    }
  }, [tariffs, selectedTariff, setFormData]);

  const handleTariffChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const foundTariff = tariffs.find((t) => t.uuid === e.target.value) || null;
      setSelectedTariff(foundTariff);

      if (foundTariff) {
        setFormData((prev) => ({
          ...prev,
          tariffUuid: foundTariff.uuid,
          basePrice: calculateTotalPrice({
            selectedTariff: foundTariff,
            selectedAdditionalServices,
            intermediatePoints: formData.intermediatePoints,
            arrivalPointUuid: formData.arrivalPoint,
            points,
          }),
        }));
        setSelectedAdditionalServices([]);
      } else {
        setFormData((prev) => ({ ...prev, tariffUuid: '', basePrice: 0 }));
      }
    },
    [
      tariffs,
      points,
      formData.intermediatePoints,
      formData.arrivalPoint,
      setFormData,
      selectedAdditionalServices,
    ],
  );

  const handleAdditionalServiceChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      const newServices = handleAdditionalServiceChange(
        e.target.checked,
        serviceUuid,
        selectedAdditionalServices,
      );
      setSelectedAdditionalServices(newServices);
      updatePrice();
    },
    [selectedAdditionalServices, updatePrice],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      try {
        const cleanedIntermediatePoints = cleanIntermediatePoints(formData.intermediatePoints);
        const orderData: CreateOrderData = {
          createdBy: formData.createdBy || '',
          tariffUuid: formData.tariffUuid || '',
          departurePoint: formData.departurePoint || '',
          arrivalPoint: formData.arrivalPoint || '',
          intermediatePoints: cleanedIntermediatePoints,
          assignedDriverId: formData.assignedDriverId || undefined,
          selectedServices: selectedAdditionalServices,
          basePrice: formData.basePrice,
          departureTime: formData.departureTime || '',
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
    },
    [formData, selectedAdditionalServices, handleOrderSuccess, handleOrderError],
  );

  return {
    clients,
    points,
    drivers,
    tariffs,
    message,
    selectedVehicleType,
    selectedServiceLevel,
    selectedTariff,
    formData,
    vehicleTypes,
    serviceLevels,
    selectedAdditionalServices,
    handleVehicleTypeChange,
    handleServiceLevelChange,
    handleTariffChange,
    handleChange,
    handleAddIntermediatePoint,
    handleRemoveIntermediatePoint,
    handleChangeIntermediatePoint,
    handleAdditionalServiceChange: handleAdditionalServiceChangeCallback,
    handleSubmit,
    getAvailablePoints,
    handleDriverSelect,
    searchDriver,
    handleSearchDriver,
    setFormData,
    page,
    perPage,
    total,
    changePage,
    changePerPage,
    isLoading,
  };
};
