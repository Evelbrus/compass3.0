'use client';

import { User, DriverProfile } from '@prisma/client';

export interface DriversResponse {
  data: {
    users: (User & { driverProfile: DriverProfile | null })[];
  };
  total: number;
  page: number;
}

/**
 * Функция для получения списка водителей с поддержкой пагинации, поиска и сортировки.
 *
 * @param search - Поисковый запрос
 * @param page - Номер страницы (по умолчанию 1)
 * @param perPage - Количество записей на страницу (по умолчанию 10)
 * @param sortBy - Поле для сортировки (по умолчанию createdAt)
 * @param sortOrder - Порядок сортировки (asc или desc, по умолчанию desc)
 */
export const fetchDrivers = async (
  search: string = '',
  page: string = '1',
  perPage: string = '4',
  sortBy: 'createdAt' | 'updatedAt' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
): Promise<DriversResponse> => {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
  });

  const response = await fetch(`/api/users?role=Driver&include=driverProfile&${params.toString()}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch drivers');
  }
  return response.json();
};
