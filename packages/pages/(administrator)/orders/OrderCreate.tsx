'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { fetchClients, fetchDrivers, fetchPoints, fetchTariffs } from './orderApi';
import { Point, ServiceLevels, User, VehicleType } from '@prisma/client';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { useSocket } from '@shared/utils/hooks/useSocket';

//Определение начального состояния формы с дефолтными значениями
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

const OrderCreate = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('');
  const [selectedTariff, setSelectedTariff] = useState<ExtendedTariff | null>(null);
  const [originalBasePrice, setOriginalBasePrice] = useState<number>(0);
  const [pointPrice, setPointPrice] = useState<number>(0);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<CreateOrderData>>(initialFormData);

  const socket = useSocket();

  const vehicleTypes = Object.values(VehicleType);
  const serviceLevels = Object.values(ServiceLevels);

  const calculateBasePrice = useCallback((tariff: ExtendedTariff): number => {
    return tariff.price + tariff.tariffAdditionalServices.reduce((acc, s) => acc + s.price, 0);
  }, []);

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

  //Загрузка клиентов и точек только один раз при монтировании
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

  //Загрузка водителей и тарифов при изменении фильтров
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

  const handleTariffChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const foundTariff = tariffs.find((t) => t.uuid === e.target.value);
      if (foundTariff) {
        const calculatedPrice = calculateBasePrice(foundTariff);
        setOriginalBasePrice(calculatedPrice);
        const additionalPointsPrice =
          foundTariff.additionalPointPrice * (formData.intermediatePoints?.length || 0);
        const total = calculatedPrice + pointPrice + additionalPointsPrice;

        setSelectedTariff(foundTariff);
        setFormData((prev) => ({
          ...prev,
          tariffUuid: foundTariff.uuid,
          basePrice: total,
        }));
        setSelectedAdditionalServices([]);
      } else {
        setOriginalBasePrice(0);
        setPointPrice(0);
        setSelectedTariff(null);
        setFormData((prev) => ({
          ...prev,
          tariffUuid: '',
          basePrice: 0,
        }));
        setSelectedAdditionalServices([]);
      }
    },
    [tariffs, calculateBasePrice, formData.intermediatePoints, pointPrice],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }));
  }, []);

  const handleAddIntermediatePoint = useCallback(() => {
    setFormData((prev) => {
      const newPoints = [...(prev.intermediatePoints || []), ''];
      const additionalPointsPrice = (selectedTariff?.additionalPointPrice || 0) * newPoints.length;
      const newBase = originalBasePrice + pointPrice + additionalPointsPrice;
      return { ...prev, intermediatePoints: newPoints, basePrice: newBase };
    });
  }, [selectedTariff, originalBasePrice, pointPrice]);

  const handleRemoveIntermediatePoint = useCallback(
    (index: number) => {
      setFormData((prev) => {
        const newPoints = (prev.intermediatePoints || []).filter((_, i) => i !== index);
        const additionalPointsPrice =
          (selectedTariff?.additionalPointPrice || 0) * newPoints.length;
        const newBase = originalBasePrice + pointPrice + additionalPointsPrice;
        return { ...prev, intermediatePoints: newPoints, basePrice: newBase };
      });
    },
    [selectedTariff, originalBasePrice, pointPrice],
  );

  const handleChangeIntermediatePoint = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => {
        const newPoints = [...(prev.intermediatePoints || [])];
        newPoints[index] = value;
        const additionalPointsPrice =
          (selectedTariff?.additionalPointPrice || 0) * newPoints.length;
        const newBase = originalBasePrice + pointPrice + additionalPointsPrice;
        return { ...prev, intermediatePoints: newPoints, basePrice: newBase };
      });
    },
    [selectedTariff, originalBasePrice, pointPrice],
  );

  const handleResetBasePrice = useCallback(() => {
    const newPoints = formData.intermediatePoints || [];
    const additionalPointsPrice = (selectedTariff?.additionalPointPrice || 0) * newPoints.length;
    const total = originalBasePrice + pointPrice + additionalPointsPrice;
    setFormData((prev) => ({ ...prev, basePrice: total }));
  }, [formData.intermediatePoints, selectedTariff, originalBasePrice, pointPrice]);

  const handleAdditionalServiceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      if (e.target.checked) {
        setSelectedAdditionalServices((prev) => [...prev, serviceUuid]);
      } else {
        setSelectedAdditionalServices((prev) => prev.filter((uuid) => uuid !== serviceUuid));
      }
    },
    [],
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1>Create Order</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <label>
          Client:
          <select name="createdBy" onChange={handleChange} value={formData.createdBy || ''}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.uuid} value={c.uuid}>
                {c.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tariff:
          <select name="tariffUuid" onChange={handleTariffChange} value={formData.tariffUuid || ''}>
            <option value="">Select a tariff</option>
            {tariffs.map((t) => (
              <option key={t.uuid} value={t.uuid}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {selectedTariff && selectedTariff.tariffAdditionalServices?.length > 0 && (
          <div>
            {selectedTariff.tariffAdditionalServices.map((s) => (
              <label key={s.uuid} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedAdditionalServices.includes(s.uuid)}
                  onChange={(e) => handleAdditionalServiceChange(e, s.uuid)}
                />
                {s.name} ({s.price})
              </label>
            ))}
          </div>
        )}
        <label>
          Vehicle Type:
          <select name="vehicleType" onChange={handleVehicleTypeChange} value={selectedVehicleType}>
            <option value="">Select a vehicle type</option>
            {vehicleTypes.map((vt) => (
              <option key={vt} value={vt}>
                {vt}
              </option>
            ))}
          </select>
        </label>
        <label>
          Service Level:
          <select
            name="serviceLevel"
            onChange={handleServiceLevelChange}
            value={selectedServiceLevel}
          >
            <option value="">Select a service level</option>
            {serviceLevels.map((sl) => (
              <option key={sl} value={sl}>
                {sl}
              </option>
            ))}
          </select>
        </label>
        <label>
          Departure Time:
          <input
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Departure Point:
          <select
            name="departurePoint"
            onChange={handleChange}
            value={formData.departurePoint || ''}
          >
            <option value="">Select a departure point</option>
            {points.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.address}
              </option>
            ))}
          </select>
        </label>
        <label>
          Arrival Point:
          <select name="arrivalPoint" onChange={handleChange} value={formData.arrivalPoint || ''}>
            <option value="">Select an arrival point</option>
            {points.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.address}
              </option>
            ))}
          </select>
        </label>
        <label>
          Intermediate Points:
          {(formData.intermediatePoints || []).map((point, index) => (
            <div key={index}>
              <select
                value={point}
                onChange={(e) => handleChangeIntermediatePoint(index, e.target.value)}
              >
                <option value="">Select an intermediate point</option>
                {points.map((po) => (
                  <option key={po.uuid} value={po.uuid}>
                    {po.address}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => handleRemoveIntermediatePoint(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIntermediatePoint}>
            Add Intermediate Point
          </button>
        </label>
        <label>
          Base Price:
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice ?? 0}
            onChange={handleChange}
          />
          <button type="button" onClick={handleResetBasePrice}>
            Reset Price
          </button>
        </label>
        <label>
          Assigned Driver:
          <select
            name="assignedDriverId"
            onChange={handleChange}
            value={formData.assignedDriverId || ''}
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.uuid} value={driver.uuid}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderCreate;
