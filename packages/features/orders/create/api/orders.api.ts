import { Point, User } from '@prisma/client';
import { Driver } from '@features/orders/create/types/types';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';
import { checkAndHandleRedirect } from '@shared/api';

const fetchData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      if (checkAndHandleRedirect(data)) {
        throw new Error('Redirect handled'); // Прерываем выполнение после редиректа
      }
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

interface FetchClientsResponse {
  users: Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>[] | null;
  total: number;
  page: number;
  perPage: number;
}

export const fetchClients = async (
  search: string = '',
  page: string = '1',
  per_page: string = '10',
  sort_by: 'address' | 'basePrice' | 'createdAt' | 'updatedAt' = 'createdAt',
  sort_order: 'asc' | 'desc' = 'asc',
): Promise<FetchClientsResponse> => {
  const params = new URLSearchParams();
  ['Client', 'ClientCorp'].forEach((role) => params.append('role', role));
  if (search) params.append('search', search);
  if (page) params.append('page', page);
  if (per_page) params.append('per_page', per_page);
  params.append('sort_by', sort_by);
  params.append('sort_order', sort_order);

  const url = `/api/admin/users?${params}`;
  const data = await fetchData(url);

  return {
    users: data.data?.users || null,
    total: data.data?.total || 0,
    page: data.data?.page || 1,
    perPage: data.data?.per_page || 10,
  };
};

export const fetchClientByUuid = async (
  uuid: string,
): Promise<Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'> | null> => {
  const url = `/api/admin/users/${uuid}`;
  try {
    const data = await fetchData(url); // Здесь уже есть обработка через fetchData
    if (data && data.uuid) {
      return {
        uuid: data.uuid,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching client by UUID:', error);
    return null;
  }
};

interface FetchDriversResponse {
  drivers: Driver[] | null;
  serverTime: Date | null;
  assignedDriverId: string | null;
  serviceLevels: string[];
  vehicleTypes: string[];
  page: number;
  perPage: number;
  total: number;
}

export const fetchDrivers = async (
  serviceLevel?: string | null,
  vehicleType?: string,
  searchQuery?: string,
  page: string = '1',
  per_page: string = '10',
): Promise<FetchDriversResponse> => {
  const params = new URLSearchParams({
    ...(serviceLevel && { serviceLevel }),
    ...(vehicleType && { vehicleType }),
    ...(searchQuery && { search: searchQuery }),
    ...(page && { page }),
    ...(per_page && { per_page }),
  });

  const response = await fetch(`/api/admin/orders/drivers?${params}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      throw new Error('Redirect handled');
    }
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data as FetchDriversResponse;
};

export const fetchAssignedDriver = async (assignedDriverId: string): Promise<Driver> => {
  const params = new URLSearchParams({ assignedDriverId });
  const response = await fetch(`/api/admin/orders/drivers?${params}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      throw new Error('Redirect handled');
    }
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data.driver as Driver;
};

export const fetchAdditionalServices = async () => {
  const url = '/api/shared/additional-services?page=1&per_page=100';
  const data = await fetchData(url); // Здесь уже есть обработка
  return data.data.additionalServices || [];
};

export const fetchTariffs = async (serviceLevel?: string, vehicleType?: string) => {
  let url = '/api/shared/tariffs';
  const params = new URLSearchParams();
  if (serviceLevel) params.append('serviceLevel', serviceLevel);
  if (vehicleType) params.append('vehicleType', vehicleType);
  if (params.toString()) url += `?${params.toString()}`;

  const data = await fetchData(url); // Здесь уже есть обработка
  return data.data.tariffs || [];
};

export interface FetchPointsResponse {
  points: Point[];
  total: number;
  page: number;
  per_page: number;
}

export const fetchPoints = async (
  search: string = '',
  page: string = '1',
  per_page: string,
  sort_by: 'address' | 'basePrice' | 'createdAt' | 'updatedAt' = 'createdAt',
  sort_order: 'asc' | 'desc' = 'asc',
): Promise<FetchPointsResponse> => {
  const params = new URLSearchParams({
    page: page,
    per_page: per_page,
    sort_by: sort_by,
    sort_order: sort_order,
    search: search,
  });

  const response = await fetch(`/api/shared/points?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      throw new Error('Redirect handled');
    }
    throw new Error('Failed to fetch points');
  }
  const data = await response.json();

  return data.data as FetchPointsResponse;
};

export const fetchPointByUuid = async (uuid: string): Promise<Point> => {
  const response = await fetch(`/api/shared/points/${uuid}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      throw new Error('Redirect handled');
    }
    throw new Error(`Failed to fetch point with UUID: ${uuid}`);
  }
  const data = await response.json();
  return data.data.point as Point;
};

export const fetchPointsByUuids = async (uuids: string[]): Promise<Point[]> => {
  const promises = uuids.map(fetchPointByUuid); // Здесь уже есть обработка в fetchPointByUuid
  return Promise.all(promises);
};

export const fetchOrderDetails = async (orderUuid: string): Promise<OrderDetail> => {
  const response = await fetch(`/api/shared/orders/${orderUuid}`);
  if (!response.ok) {
    const data = await response.json();
    if (checkAndHandleRedirect(data)) {
      throw new Error('Redirect handled');
    }
    throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
  }
  const data = await response.json();
  return data as OrderDetail;
};
