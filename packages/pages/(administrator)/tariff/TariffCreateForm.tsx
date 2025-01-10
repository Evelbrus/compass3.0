'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AdditionalService, ServiceLevels, VehicleType } from '@prisma/client';
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface';

interface FormData extends Omit<CreateTariffData, 'clientTypes' | 'vehicleType' | 'serviceLevel'> {
  vehicleType: VehicleType | undefined;
  serviceLevel: ServiceLevels | undefined;
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

  useEffect(() => {
    //Fetch additional services
    fetch('/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc')
      .then((response) => response.json())
      .then((data) => setAdditionalServices(data.data.additionalServices))
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
  const handleAdditionalServicesChange = (
    index: number,
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value, type } = event.target;
    const newAdditionalServices = [...formData.tariffAdditionalServices];
    newAdditionalServices[index] = {
      ...newAdditionalServices[index],
      [name]: type === 'number' ? parseFloat(value) : value,
    };
    setFormData((prevData) => ({
      ...prevData,
      tariffAdditionalServices: newAdditionalServices,
    }));
  };

  //Add new additional service
  const addAdditionalService = () => {
    setFormData((prevData) => ({
      ...prevData,
      tariffAdditionalServices: [
        ...prevData.tariffAdditionalServices,
        { serviceUuid: '', price: 0, isAvailable: true },
      ],
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

  return (
    <div>
      <h1>Create Tariff</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="vehicleType">Vehicle Type:</label>
          <select
            id="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            required
          >
            {Object.values(VehicleType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={formData.description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="additionalPointPrice">Additional Point Price:</label>
          <input
            type="number"
            id="additionalPointPrice"
            value={formData.additionalPointPrice}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="freeWaitTimeBishkek">Free Wait Time Bishkek:</label>
          <input
            type="number"
            id="freeWaitTimeBishkek"
            value={formData.freeWaitTimeBishkek}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="pricePerMinuteAfterBishkek">Price Per Minute After Bishkek:</label>
          <input
            type="number"
            id="pricePerMinuteAfterBishkek"
            value={formData.pricePerMinuteAfterBishkek}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="freeWaitTimeAirport">Free Wait Time Airport:</label>
          <input
            type="number"
            id="freeWaitTimeAirport"
            value={formData.freeWaitTimeAirport}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="pricePerMinuteAfterAirport">Price Per Minute After Airport:</label>
          <input
            type="number"
            id="pricePerMinuteAfterAirport"
            value={formData.pricePerMinuteAfterAirport}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="serviceLevel">Service Level:</label>
          <select
            id="serviceLevel"
            value={formData.serviceLevel}
            onChange={handleInputChange}
            required
          >
            {Object.values(ServiceLevels).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h2>Additional Services</h2>
          {formData.tariffAdditionalServices.map((additionalService, index) => (
            <div key={index}>
              <select
                name="serviceUuid"
                value={additionalService.serviceUuid}
                onChange={(e) => handleAdditionalServicesChange(index, e)}
                required
              >
                <option value="">Select Additional Service</option>
                {additionalServices.map((service) => (
                  <option key={service.uuid} value={service.uuid}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="price"
                value={additionalService.price}
                onChange={(e) => handleAdditionalServicesChange(index, e)}
                required
              />
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={additionalService.isAvailable}
                  onChange={(e) =>
                    handleAdditionalServicesChange(index, e as ChangeEvent<HTMLInputElement>)
                  }
                />
                Available
              </label>
            </div>
          ))}
          <button type="button" onClick={addAdditionalService}>
            Add Additional Service
          </button>
        </div>
        <button type="submit">Create Tariff</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TariffCreateForm;
