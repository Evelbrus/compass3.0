'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { VehicleType, Color, User, DriverProfile, ServiceLevels } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { DetailVehicleData, EditVehicleData } from '@shared/prisma/interface/vehicles/interface';

interface VehiclesEditProps {
  data: DetailVehicleData;
}

//Преобразуем дату в строку формата YYYY-MM-DD
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${month}-${day}`;
};

const VehiclesEdit: React.FC<VehiclesEditProps> = ({ data }) => {
  const [formData, setFormData] = useState<EditVehicleData>({
    ...data,
    driverIds: data.vehicleDrivers.map((driver) => driver.driver.uuid),
  });

  const [yearInput, setYearInput] = useState<string>(data.year ? formatDate(data.year) : '');

  const [drivers, setDrivers] = useState<(User & { driverProfile: DriverProfile | null })[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    //Fetch drivers with role 'Driver'
    fetch('/api/users?role=Driver&include=driverProfile')
      .then((response) => response.json())
      .then((data) => setDrivers(data.users))
      .catch((error) => console.error('Error fetching drivers:', error));
  }, []);

  //Handle form input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;

    if (id === 'year') {
      setYearInput(value);
    } else if (id === 'driverIds') {
      setFormData((prevData) => ({
        ...prevData,
        driverIds: [value],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  //Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const updatedData = {
        ...formData,
        year: yearInput ? new Date(yearInput) : null,
        uuid: data.uuid,
      };

      const response = await fetch(`/api/vehicles/${data.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`Vehicle updated successfully: ${result.brand} ${result.model}`);
      //Redirect to vehicle details page
      router.push(`/vehicles/${data.uuid}`);
    } catch (error) {
      setMessage(`Error updating vehicle: ${(error as Error).message}`);
      console.error('There was an error updating the vehicle!', error);
    }
  };

  return (
    <div>
      <h1>Edit Vehicle</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vehicleType">Vehicle Type:</label>
          <select
            id="vehicleType"
            value={formData.vehicleType || ''}
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
            value={formData.brand || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="model">Model:</label>
          <input
            type="text"
            id="model"
            value={formData.model || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="year">Year:</label>
          <input
            type="text"
            id="year"
            value={yearInput || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="color">Color:</label>
          <select id="color" value={formData.color || ''} onChange={handleInputChange} required>
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
            value={formData.plateNumber || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="isAvailable">Is Available:</label>
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable || false}
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
          <label htmlFor="driverIds">Driver:</label>
          <select id="driverIds" value={formData.driverIds?.[0] || ''} onChange={handleInputChange}>
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.driverProfile?.uuid} value={driver.driverProfile?.uuid}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="serviceLevels">Service Level:</label>
          <select
            id="serviceLevels"
            value={formData.serviceLevels || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Service Level</option>
            {Object.values(ServiceLevels).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Save</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VehiclesEdit;
