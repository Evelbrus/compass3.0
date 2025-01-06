'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { VehicleType, Color, ServiceLevel, User, DriverProfile } from '@prisma/client';
import { CreateVehicleData } from '@shared/prisma/interface/vehicles/interface';

const VehiclesCreate: React.FC = () => {
  const [formData, setFormData] = useState<CreateVehicleData>({
    vehicleType: VehicleType.None,
    brand: '',
    model: '',
    year: null,
    color: Color.None,
    plateNumber: '',
    isAvailable: true,
    photoPath: '',
    driverId: '',
    serviceLevelId: '',
  });

  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [serviceLevels, setServiceLevels] = useState<ServiceLevel[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    //Fetch drivers with role 'Driver'
    fetch('/api/users?role=Driver&include=driverProfile')
      .then((response) => response.json())
      .then((data) => setDrivers(data.users))
      .catch((error) => console.error('Error fetching drivers:', error));

    //Fetch service levels
    fetch('/api/service-levels?page=1&per_page=100&sort_by=name&sort_order=asc')
      .then((response) => response.json())
      .then((data) => setServiceLevels(data.serviceLevels))
      .catch((error) => console.error('Error fetching service levels:', error));
  }, []);

  //Handle form input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;

    setFormData((prevData) => ({
      ...prevData,
      [id]:
        type === 'number'
          ? value
            ? parseInt(value)
            : null
          : type === 'checkbox'
            ? checked
            : value,
    }));
  };

  //Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('formData', formData);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Vehicle created successfully: ${result.brand} ${result.model}`);
    } catch (error) {
      setMessage(`Error creating vehicle: ${(error as Error).message}`);
      console.error('There was an error creating the vehicle!', error);
    }
  };

  return (
    <div>
      <h1>Create Vehicle</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vehicleType">Vehicle Type:</label>
          <select
            id="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Vehicle Type</option>
            {Object.values(VehicleType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="brand">Brand:</label>
          <input
            type="text"
            id="brand"
            value={formData.brand}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="model">Model:</label>
          <input
            type="text"
            id="model"
            value={formData.model}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="year">Year:</label>
          <input
            type="number"
            id="year"
            value={formData.year !== null ? formData.year.toString() : ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="color">Color:</label>
          <select id="color" value={formData.color} onChange={handleInputChange} required>
            <option value="">Select Color</option>
            {Object.values(Color).map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="plateNumber">Plate Number:</label>
          <input
            type="text"
            id="plateNumber"
            value={formData.plateNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="isAvailable">Is Available:</label>
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="photoPath">Photo Path:</label>
          <input
            type="text"
            id="photoPath"
            value={formData.photoPath || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="driverId">Driver:</label>
          <select id="driverId" value={formData.driverId} onChange={handleInputChange}>
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.driverProfile?.uuid} value={driver.driverProfile?.uuid}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="serviceLevelId">Service Level:</label>
          <select
            id="serviceLevelId"
            value={formData.serviceLevelId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Service Level</option>
            {serviceLevels.map((serviceLevel) => (
              <option key={serviceLevel.uuid} value={serviceLevel.uuid}>
                {serviceLevel.name} ({serviceLevel.serviceType})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Create Vehicle</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VehiclesCreate;
