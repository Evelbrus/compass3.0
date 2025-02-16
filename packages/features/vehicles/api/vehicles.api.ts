'use client';

import { User, DriverProfile } from '@prisma/client';

export interface DriversResponse {
  data: {
    users: (User & { driverProfile: DriverProfile | null })[];
  };
}

/**
 * Функция для получения списка водителей (пользователей с ролью Driver)
 */
export const fetchDrivers = async (): Promise<DriversResponse> => {
  const response = await fetch('/api/users?role=Driver&include=driverProfile');
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch drivers');
  }
  return response.json();
};
