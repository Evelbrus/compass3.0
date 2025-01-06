'use client';

import React, { useState, FormEvent } from 'react';
import { ServiceLevel, ServiceLevels } from '@prisma/client';
import { EditServiceLevelData } from '@shared/prisma/interface/service-levels/interface';

interface ReferenceEditBooksProps {
  data: ServiceLevel;
}

const ReferenceEditBooks: React.FC<ReferenceEditBooksProps> = ({ data }) => {
  const [name, setName] = useState(data.name);
  const [serviceType, setServiceType] = useState<ServiceLevels | ''>(data.serviceType);
  const [price, setPrice] = useState(data.price.toString());
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const updatedServiceLevelData: EditServiceLevelData = {
      name,
      serviceType: serviceType as ServiceLevels,
      price: parseFloat(price),
    };

    try {
      const response = await fetch(`/api/service-levels/${data.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedServiceLevelData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setMessage(`Service level updated successfully: ${result.name}`);
    } catch (error) {
      setMessage('Error updating service level');
      console.error('There was an error updating the service level!', error);
    }
  };

  return (
    <div>
      <h1>Edit Service Level</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="serviceType">Service Type:</label>
          <select
            id="serviceType"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceLevels)}
            required
          >
            <option value="">Select Service Type</option>
            <option value={ServiceLevels.Economy}>Economy</option>
            <option value={ServiceLevels.Business}>Business</option>
            <option value={ServiceLevels.VIP}>VIP</option>
          </select>
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Service Level</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ReferenceEditBooks;
