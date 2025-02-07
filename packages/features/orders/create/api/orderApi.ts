import { Point, User } from '@prisma/client';

const fetchData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

interface FetchClientsResponse {
  users: User[];
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

  const url = `/api/orders/clients?${params}`;
  const data = await fetchData(url);
  return data.data as FetchClientsResponse;
};

//Функция для получения клиента по UUID (не изменилась)
export const fetchClientByUuid = async (uuid: string): Promise<User | null> => {
  const url = `/api/orders/clients/${uuid}`;
  try {
    const response = await fetchData(url);
    return response.data as User;
  } catch (error) {
    console.error('Error fetching client by UUID:', error);
    return null;
  }
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

  const response = await fetch(`/api/points?${params.toString()}`);
  if (!response.ok) {
    const error = new Error('Failed to fetch points');
    console.error('Error fetching points:', error);
    throw error;
  }
  const data = await response.json();

  return data.data as FetchPointsResponse;
};

export const fetchPointByUuid = async (uuid: string): Promise<Point> => {
  const response = await fetch(`/api/points/${uuid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch point with UUID: ${uuid}`);
  }
  const data = await response.json();
  return data.data.point as Point;
};

export const fetchPointsByUuids = async (uuids: string[]): Promise<Point[]> => {
  const promises = uuids.map(fetchPointByUuid);
  return Promise.all(promises);
};

export const fetchAdditionalServices = async () => {
  const url = '/api/additional-services?page=1&per_page=100';
  const data = await fetchData(url);
  return data.data.additionalServices || [];
};

interface FetchDriversResponse {
  drivers: User[];
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

  const response = await fetch(`/api/orders/drivers?${params}`);
  const data = await response.json();
  return data.data as FetchDriversResponse;
};

//Запрос назначенного водителя
export const fetchAssignedDriver = async (assignedDriverId: string): Promise<User> => {
  const params = new URLSearchParams({ assignedDriverId });
  const response = await fetch(`/api/orders/drivers?${params}`);
  const data = await response.json();
  return data.data.driver as User;
};

export const fetchTariffs = async (serviceLevel?: string, vehicleType?: string) => {
  let url = '/api/tariffs';
  const params = new URLSearchParams();
  if (serviceLevel) params.append('serviceLevel', serviceLevel);
  if (vehicleType) params.append('vehicleType', vehicleType);
  if (params.toString()) url += `?${params.toString()}`;

  const data = await fetchData(url);
  return data.data.tariffs || [];
};
