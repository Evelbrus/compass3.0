'use client';

import React, { FormEvent, useState } from 'react';
import { Decimal } from 'decimal.js';

const CreatePoint = () => {
  const [address, setAddress] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const pointData = {
      address,
      basePrice: new Decimal(basePrice),
    };

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pointData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessage(`Point created successfully: ${data.address}`);
      setAddress('');
      setBasePrice('');
    } catch (error) {
      setMessage('Error creating point');
      console.error('There was an error creating the point!', error);
    }
  };

  return (
    <div>
      <h1>Create a New Point</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="basePrice">Base Price:</label>
          <input
            type="number"
            id="basePrice"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Point</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePoint;
