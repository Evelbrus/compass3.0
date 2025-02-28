import { User } from '@prisma/client';

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

  const url = `/api/orders/clients?${params}`;
  const data = await fetchData(url);
  return data.data as FetchClientsResponse;
};

//Функция для получения клиента по UUID (не изменилась)
export const fetchClientByUuid = async (
  uuid: string,
): Promise<Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'> | null> => {
  const url = `/api/orders/clients/${uuid}`;
  try {
    const response = await fetchData(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching client by UUID:', error);
    return null;
  }
};

interface FetchDriversResponse {
  drivers: Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>[] | null;
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
export const fetchAssignedDriver = async (
  assignedDriverId: string,
): Promise<Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>> => {
  const params = new URLSearchParams({ assignedDriverId });
  const response = await fetch(`/api/orders/drivers?${params}`);
  const data = await response.json();
  return data.data.driver as Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;
};

export const fetchAdditionalServices = async () => {
  const url = '/api/additional-services?page=1&per_page=100';
  const data = await fetchData(url);
  return data.data.additionalServices || [];
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
