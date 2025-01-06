'use client';

import React, { FormEvent, useState } from 'react';
import { ServiceLevel } from '@prisma/client';

const CreateServiceLevel = () => {
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceLevel['serviceType'] | ''>('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const serviceLevelData = {
      name,
      serviceType: serviceType as ServiceLevel['serviceType'],
      price: parseFloat(price),
    };

    try {
      const response = await fetch('/api/service-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceLevelData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessage(`Service level created successfully: ${data.name}`);
      setName('');
      setServiceType('');
      setPrice('');
    } catch (error) {
      setMessage('Error creating service level');
      console.error('There was an error creating the service level!', error);
    }
  };

  return (
    <div>
      <h1>Create a New Service Level</h1>
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
            onChange={(e) => setServiceType(e.target.value as ServiceLevel['serviceType'])}
            required
          >
            <option value="">Select Service Type</option>
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="VIP">VIP</option>
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
        <button type="submit">Create Service Level</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateServiceLevel;
