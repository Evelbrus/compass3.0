'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent, JSX } from 'react';
import { User, Point, OrderStatus, DriverProfile } from '@prisma/client';
import { EditOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import Decimal from 'decimal.js';

interface OrderEditProps {
  uuid: string;
}

const OrderEdit: React.FC<OrderEditProps> = ({ uuid }): JSX.Element => {
  const [formData, setFormData] = useState<EditOrderData | undefined>(undefined);
  const [clients, setClients] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [tariffs, setTariffs] = useState<ExtendedTariff[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //Запрос данных заказа
        const response = await fetch(`/api/orders/${uuid}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const orderData = await response.json();
        setFormData(orderData);

        const clientsResponse = await fetch('/api/users?role=Client&role=ClientCorp');
        if (!clientsResponse.ok) throw new Error('Network response was not ok');
        const clientsData = await clientsResponse.json();
        setClients(clientsData.users);

        const driversResponse = await fetch('/api/users?role=Driver');
        if (!driversResponse.ok) throw new Error('Network response was not ok');
        const driversData = await driversResponse.json();
        setDrivers(driversData.users);

        const tariffsResponse = await fetch(
          '/api/tariffs?include=tariffAdditionalServices,tariffOnServiceLevels',
        );
        if (!tariffsResponse.ok) throw new Error('Network response was not ok');
        const tariffsData = await tariffsResponse.json();

        const extendedTariffs: ExtendedTariff[] = tariffsData.tariffs.map(
          (tariff: ExtendedTariff) => ({
            ...tariff,
            tariffAdditionalServices: tariff.tariffAdditionalServices || [],
            tariffOnServiceLevels: tariff.tariffOnServiceLevels || [],
          }),
        );
        setTariffs(extendedTariffs);

        const pointsResponse = await fetch(
          '/api/points?page=1&per_page=100&sort_by=address&sort_order=asc',
        );
        if (!pointsResponse.ok) throw new Error('Network response was not ok');
        const pointsData = await pointsResponse.json();
        setPoints(pointsData.points);

        //Инициализация formData после загрузки всех данных
        setFormData((prevData) => ({
          ...prevData!,
          createdBy:
            clientsData.users.find((user) => user.uuid === prevData?.createdById) || ({} as User),
          tariff:
            extendedTariffs.find((tariff) => tariff.uuid === prevData?.tariffUuid) ||
            ({} as ExtendedTariff),
          departurePoint:
            pointsData.points.find((point) => point.uuid === prevData?.departurePointId) ||
            ({} as Point),
          arrivalPoint:
            pointsData.points.find((point) => point.uuid === prevData?.arrivalPointId) ||
            ({} as Point),
          departureTime: new Date(prevData?.departureTime || ''), //Преобразуем строку в дату
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

  const calculateBasePrice = (tariff: ExtendedTariff, arrivalPoint: Point): Decimal => {
    let basePrice = new Decimal(0);

    if (tariff) {
      basePrice = basePrice.plus(tariff.additionalPointPrice);
      tariff.tariffAdditionalServices.forEach((service) => {
        basePrice = basePrice.plus(service.price);
      });
      tariff.tariffOnServiceLevels.forEach((level) => {
        basePrice = basePrice.plus(level.service.price);
      });
    }

    if (arrivalPoint) {
      basePrice = basePrice.plus(new Decimal(arrivalPoint.basePrice));
    }

    return basePrice;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    if (id === 'arrivalPointId' || id === 'tariffUuid') {
      const selectedTariff = tariffs.find(
        (t) => t.uuid === (id === 'tariffUuid' ? value : formData?.tariffUuid),
      );
      const selectedArrivalPoint = points.find(
        (p) => p.uuid === (id === 'arrivalPointId' ? value : formData?.arrivalPointId),
      );

      const newBasePrice = calculateBasePrice(
        selectedTariff || formData?.tariff || ({} as ExtendedTariff),
        selectedArrivalPoint || formData?.arrivalPoint || ({} as Point),
      );

      setFormData((prevData) => ({
        ...prevData!,
        [id]: value,
        basePrice: newBasePrice,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData!,
        [id]: id === 'basePrice' ? new Decimal(value) : value,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData) {
      setMessage('Form data is not initialized');
      return;
    }

    try {
      const orderData: EditOrderData = {
        ...formData,
      };

      const response = await fetch(`/api/orders/${uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Order updated successfully: ${result.uuid}`);
    } catch (error) {
      setMessage(`Error updating order: ${(error as Error).message}`);
      console.error('There was an error updating the order!', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Edit Order</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="createdById">Client:</label>
          <select
            id="createdById"
            value={formData?.createdById || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Client</option>
            {clients.map((user) => (
              <option key={user.uuid} value={user.uuid}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assignedDriverId">Driver:</label>
          <select
            id="assignedDriverId"
            value={formData?.assignedDriverId || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Driver</option>
            {drivers.map((user) => (
              <option key={user.driverProfile?.uuid} value={user.driverProfile?.uuid || ''}>
                {user.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tariffUuid">Tariff:</label>
          <select
            id="tariffUuid"
            value={formData?.tariffUuid || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Tariff</option>
            {tariffs.map((tariff) => (
              <option key={tariff.uuid} value={tariff.uuid}>
                {tariff.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="departureTime">Departure Time:</label>
          <input
            type="datetime-local"
            id="departureTime"
            value={
              formData?.departureTime
                ? new Date(formData.departureTime).toISOString().slice(0, -1)
                : ''
            }
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="departurePointId">Departure Point:</label>
          <select
            id="departurePointId"
            value={formData?.departurePointId || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Departure Point</option>
            {points.map((point) => (
              <option key={point.uuid} value={point.uuid}>
                {point.address}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="arrivalPointId">Arrival Point:</label>
          <select
            id="arrivalPointId"
            value={formData?.arrivalPointId || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Arrival Point</option>
            {points.map((point) => (
              <option key={point.uuid} value={point.uuid}>
                {point.address}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="basePrice">Base Price:</label>
          <input
            type="number"
            id="basePrice"
            value={formData?.basePrice ? formData.basePrice.toString() : ''}
            onChange={handleInputChange}
            readOnly
          />
        </div>
        <button type="submit">Update Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderEdit;
