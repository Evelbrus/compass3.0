'use client';

import React, { FormEvent, useState } from 'react';
import { CreateAdditionalServiceData } from '@shared/prisma/interface/additional-services/interface';

const CreateAdditionalService = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const additionalServiceData: CreateAdditionalServiceData = {
      name,
    };

    try {
      const response = await fetch('/api/additional-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(additionalServiceData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessage(`Additional service created successfully: ${data.name}`);
      setName('');
    } catch (error) {
      setMessage('Error creating additional service');
      console.error('There was an error creating the additional service!', error);
    }
  };

  return (
    <div>
      <h1>Create a New Additional Service</h1>
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
        <button type="submit">Create Additional Service</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateAdditionalService;
