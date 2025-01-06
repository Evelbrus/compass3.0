'use client';

import React, { useEffect, useState, JSX } from 'react';
import { Point } from '@prisma/client';
import Decimal from 'decimal.js';

const Points = (): JSX.Element => {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`/api/points?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPoints(data.points);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching points:', error);
        setError('Error fetching points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [page, perPage]);

  return (
    <div>
      <h1>Points</h1>
      <p>Welcome to the Points Reference Book. Here you can view all points.</p>
      <h2>Points:</h2>
      {loading && <p>Loading points...</p>}
      {error && <p>{error}</p>}
      <ul>
        {points.map((point) => (
          <li key={point.uuid}>
            {point.address} - ${new Decimal(point.basePrice).toFixed(2)}
          </li>
        ))}
      </ul>
      <div>
        <p>Total Points: {total}</p>
        <button onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page <= 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)} disabled={points.length < perPage}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Points;
