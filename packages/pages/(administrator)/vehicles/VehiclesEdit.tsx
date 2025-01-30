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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Vehicle</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-6 bg-white shadow-md rounded-lg border border-gray-200"
      >
        <div>
          <label
            htmlFor="vehicleType"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Vehicle Type:
          </label>
          <select
            id="vehicleType"
            value={formData.vehicleType || ''}
            onChange={handleInputChange}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
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
          <label
            htmlFor="brand"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Brand:
          </label>
          <input
            type="text"
            id="brand"
            value={formData.brand || ''}
            onChange={handleInputChange}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            required
          />
        </div>
        <div>
          <label
            htmlFor="model"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Model:
          </label>
          <input
            type="text"
            id="model"
            value={formData.model || ''}
            onChange={handleInputChange}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            required
          />
        </div>
        <div>
          <label
            htmlFor="year"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Year:
          </label>
          <input
            type="text"
            id="year"
            value={yearInput || ''}
            onChange={handleInputChange}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            required
          />
        </div>
        <div>
          <label
            htmlFor="color"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Color:
          </label>
          <select
            id="color"
            value={formData.color || ''}
            onChange={handleInputChange}
            required
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
          >
            <option value="">Select Color</option>
            {Object.values(Color || {}).map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="plateNumber"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Plate Number:
          </label>
          <input
            type="text"
            id="plateNumber"
            value={formData.plateNumber || ''}
            onChange={handleInputChange}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            required
          />
        </div>
        <label
          htmlFor="isAvailable"
          className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
        >
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable || false}
            className="w-[18px] h-[18px] bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            onChange={handleInputChange}
          />
          Is Available:
        </label>
        <div>
          <label
            htmlFor="driverIds"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Driver:
          </label>
          <select
            id="driverIds"
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            value={formData.driverIds?.[0] || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Driver</option>
            {drivers?.map((driver) => (
              <option key={driver.driverProfile?.uuid} value={driver.driverProfile?.uuid}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="serviceLevels"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Service Level:
          </label>
          <select
            id="serviceLevels"
            value={formData.serviceLevels || ''}
            onChange={handleInputChange}
            required
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
          >
            <option value="">Select Service Level</option>
            {Object.values(ServiceLevels).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-[#2A3037] rounded-[8px] font-inter font-normal text-[17px] leading-[20.57px] p-[10px] text-white h-fit mt-[22px]"
        >
          Save
        </button>
        <div>
          <label
            htmlFor="photoPath"
            className="block mb-2 text-[#989898] font-normal text-[14px] leading-[13.93px] flex items-center gap-[5px]"
          >
            Photo Path:
          </label>
          <input
            type="text"
            id="photoPath"
            value={formData.photoPath || ''}
            className="w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
            onChange={handleInputChange}
          />
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VehiclesEdit;
