'use client';

import React, { useEffect, useState, JSX } from 'react';
import { ServiceLevel } from '@prisma/client';

const ServiceLevels = (): JSX.Element => {
  const [serviceLevels, setServiceLevels] = useState<ServiceLevel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchServiceLevels = async () => {
      try {
        const response = await fetch(`/api/service-levels?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setServiceLevels(data.serviceLevels);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching service levels:', error);
        setError('Error fetching service levels');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceLevels();
  }, [page, perPage]);

  return (
    <div>
      <h1>Service Levels</h1>
      <p>Welcome to the Service Levels Reference Book. Here you can view all service levels.</p>
      <h2>Service Levels:</h2>
      {loading && <p>Loading service levels...</p>}
      {error && <p>{error}</p>}
      <ul>
        {serviceLevels.map((serviceLevel) => (
          <li key={serviceLevel.uuid}>
            {serviceLevel.name} ({serviceLevel.serviceType}) - ${serviceLevel.price}
          </li>
        ))}
      </ul>
      <div>
        <p>Total Service Levels: {total}</p>
        <button onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page <= 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)} disabled={serviceLevels.length < perPage}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ServiceLevels;
