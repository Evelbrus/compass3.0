//useOrderCreateLogic.tsx
import React from 'react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import {
  fetchClients,
  fetchDrivers,
  fetchPoints,
  fetchTariffs,
} from '@pages/(administrator)/orders/create/orderApi';
import { Point, ServiceLevels, User, VehicleType } from '@prisma/client';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { useSocket } from '@shared/utils/hooks/useSocket';

const initialFormData: Partial<CreateOrderData> = {
  intermediatePoints: [],
  basePrice: 0,
  assignedDriverId: null,
  createdBy: '',
  tariffUuid: '',
  departurePoint: '',
  arrivalPoint: '',
  departureTime: '',
};

export const useOrderCreateLogic = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('');
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<CreateOrderData>>(initialFormData);

  const socket = useSocket();

  const vehicleTypes = Object.values(VehicleType);
  const serviceLevels = Object.values(ServiceLevels);

  const calculateTotalPrice = useCallback(() => {
    if (!selectedTariff) return 0;

    //Base tariff price
    let total = selectedTariff.price;

    //Selected additional services
    total += selectedTariff.tariffAdditionalServices
      .filter((service) => selectedAdditionalServices.includes(service.uuid))
      .reduce((acc, service) => acc + service.price, 0);

    //Intermediate points
    total += (formData.intermediatePoints?.length || 0) * selectedTariff.additionalPointPrice;

    //Arrival point price
    if (formData.arrivalPoint) {
      const arrivalPoint = points.find((point) => point.uuid === formData.arrivalPoint);
      if (arrivalPoint && arrivalPoint.basePrice) {
        //Проверяем, что basePrice существует и является объектом Decimal
        if (typeof arrivalPoint.basePrice === 'object' && arrivalPoint.basePrice.toNumber) {
          total += arrivalPoint.basePrice.toNumber();
        } else if (typeof arrivalPoint.basePrice === 'number') {
          total += arrivalPoint.basePrice;
        } else if (typeof arrivalPoint.basePrice === 'string') {
          total += parseFloat(arrivalPoint.basePrice);
        }
      }
    }

    return total;
  }, [
    selectedTariff,
    selectedAdditionalServices,
    formData.intermediatePoints,
    formData.arrivalPoint,
    points,
  ]);

  useEffect(() => {
    if (selectedTariff) {
      const newPrice = calculateTotalPrice();
      setFormData((prev) => ({ ...prev, basePrice: newPrice }));
    }
  }, [
    selectedTariff,
    selectedAdditionalServices,
    formData.intermediatePoints,
    calculateTotalPrice,
  ]);

  const setErrorMessage = useCallback((error: any, customMessage: string) => {
    console.error(error);
    setMessage(customMessage);
  }, []);

  const updateTariffs = useCallback(
    async (serviceLevel?: string, vehicleType?: string) => {
      try {
        const tariffsData = await fetchTariffs(serviceLevel, vehicleType);
        setTariffs(tariffsData);
      } catch (error) {
        setErrorMessage(error, 'Error fetching tariffs');
      }
    },
    [setErrorMessage],
  );

  const fetchAllDrivers = useCallback(async () => {
    try {
      const driversData = await fetchDrivers(selectedServiceLevel, selectedVehicleType);
      setDrivers(driversData);
    } catch (error) {
      setErrorMessage(error, 'Error fetching drivers');
    }
  }, [selectedServiceLevel, selectedVehicleType, setErrorMessage]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [clientsData, pointsData] = await Promise.all([fetchClients(), fetchPoints()]);
        setClients(clientsData);
        setPoints(pointsData);
      } catch (error) {
        setErrorMessage(error, 'Error fetching initial data');
      }
    };

    fetchInitialData();
  }, [setErrorMessage]);

  useEffect(() => {
    const fetchDriversAndTariffs = async () => {
      try {
        await updateTariffs(selectedServiceLevel, selectedVehicleType);
        await fetchAllDrivers();
      } catch (error) {
        setErrorMessage(error, 'Error fetching drivers and tariffs');
      }
    };

    fetchDriversAndTariffs();
  }, [selectedServiceLevel, selectedVehicleType, updateTariffs, fetchAllDrivers, setErrorMessage]);

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
  }, [tariffs, selectedTariff]);

  const handleTariffChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const foundTariff = tariffs.find((t) => t.uuid === e.target.value) || null;
      setSelectedTariff(foundTariff);

      if (foundTariff) {
        setFormData((prev) => ({
          ...prev,
          tariffUuid: foundTariff.uuid,
          basePrice: calculateTotalPrice(),
        }));
        setSelectedAdditionalServices([]);
      } else {
        setFormData((prev) => ({ ...prev, tariffUuid: '', basePrice: 0 }));
      }
    },
    [tariffs, calculateTotalPrice],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }));
  }, []);

  const handleAddIntermediatePoint = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      intermediatePoints: [...(prev.intermediatePoints || []), ''],
      basePrice: calculateTotalPrice(),
    }));
  }, [calculateTotalPrice]);

  const handleRemoveIntermediatePoint = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        intermediatePoints: (prev.intermediatePoints || []).filter((_, i) => i !== index),
        basePrice: calculateTotalPrice(),
      }));
    },
    [calculateTotalPrice],
  );

  const handleChangeIntermediatePoint = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newPoints = [...(prev.intermediatePoints || [])];
      newPoints[index] = value;
      return { ...prev, intermediatePoints: newPoints };
    });
  }, []);

  const handleAdditionalServiceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      const newServices = e.target.checked
        ? [...selectedAdditionalServices, serviceUuid]
        : selectedAdditionalServices.filter((uuid) => uuid !== serviceUuid);

      setSelectedAdditionalServices(newServices);
      setFormData((prev) => ({ ...prev, basePrice: calculateTotalPrice() }));
    },
    [selectedAdditionalServices, calculateTotalPrice],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      try {
        const cleanedIntermediatePoints = (formData.intermediatePoints ?? []).filter(
          (point) => point.trim() !== '',
        );
        const orderData: CreateOrderData = {
          createdBy: formData.createdBy || '',
          tariffUuid: formData.tariffUuid || '',
          departurePoint: formData.departurePoint || '',
          arrivalPoint: formData.arrivalPoint || '',
          intermediatePoints: cleanedIntermediatePoints,
          assignedDriverId: formData.assignedDriverId,
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
        setMessage(`Order created successfully: ${result.uuid}`);

        if (socket && formData.assignedDriverId) {
          socket.emit('notification', {
            userId: formData.assignedDriverId,
            notification: {
              title: 'Новый заказ',
              message: `Вам назначен новый заказ от ${formData.departurePoint} до ${formData.arrivalPoint}`,
            },
          });
        }
      } catch (error) {
        setMessage(`Error creating order: ${(error as Error).message}`);
        console.error(error);
      }
    },
    [formData, selectedAdditionalServices, socket],
  );

  const getAvailablePoints = useCallback(
    (excludePoints: string[]) => {
      return points.filter((point) => !excludePoints.includes(point.uuid));
    },
    [points],
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
    handleAdditionalServiceChange,
    handleSubmit,
    getAvailablePoints,
  };
};
