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

export const fetchClients = async () => {
  const url = '/api/users?role=Client&role=ClientCorp';
  const data = await fetchData(url);
  return data.data.users || [];
};

export const fetchPoints = async () => {
  const url = '/api/points?page=1&per_page=100&sort_by=address&sort_order=asc';
  const data = await fetchData(url);
  return data.data.points || [];
};

export const fetchDrivers = async (
  serviceLevel?: string,
  vehicleType?: string,
  search?: string,
  page?: number,
  perPage?: number,
) => {
  const params = new URLSearchParams();

  if (serviceLevel) params.append('serviceLevel', serviceLevel);
  if (vehicleType) params.append('vehicleType', vehicleType);
  if (search) params.append('search', search);
  if (page) params.append('page', page.toString());
  if (perPage) params.append('per_page', perPage.toString());

  const url = `/api/orders/drivers?${params.toString()}`;
  const data = await fetchData(url);
  return data.data || [];
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
