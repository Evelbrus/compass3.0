'use client';

import React, { useEffect, useState, JSX } from 'react';
import { AdditionalService } from '@prisma/client';

const AdditionalServices = (): JSX.Element => {
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchAdditionalServices = async () => {
      try {
        const response = await fetch(`/api/additional-services?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAdditionalServices(data.additionalServices);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching additional services:', error);
        setError('Error fetching additional services');
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalServices();
  }, [page, perPage]);

  return (
    <div>
      <h1>Additional Services</h1>
      <p>
        Welcome to the Additional Services Reference Book. Here you can view all additional
        services.
      </p>
      <h2>Additional Services:</h2>
      {loading && <p>Loading additional services...</p>}
      {error && <p>{error}</p>}
      <ul>
        {additionalServices.map((service) => (
          <li key={service.uuid}>
            {service.name} - ${service.price}
          </li>
        ))}
      </ul>
      <div>
        <p>Total Additional Services: {total}</p>
        <button onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page <= 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)} disabled={additionalServices.length < perPage}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AdditionalServices;
