const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Network response was not ok: ${response.statusText}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};
export const fetchClients = async (search = '', page = '1', per_page = '10', sort_by = 'createdAt', sort_order = 'asc') => {
    const params = new URLSearchParams();
    ['Client', 'ClientCorp'].forEach((role) => params.append('role', role));
    if (search)
        params.append('search', search);
    if (page)
        params.append('page', page);
    if (per_page)
        params.append('per_page', per_page);
    params.append('sort_by', sort_by);
    params.append('sort_order', sort_order);
    const url = `/api/orders/clients?${params}`;
    const data = await fetchData(url);
    return data.data;
};
//Функция для получения клиента по UUID (не изменилась)
export const fetchClientByUuid = async (uuid) => {
    const url = `/api/orders/clients/${uuid}`;
    try {
        const response = await fetchData(url);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching client by UUID:', error);
        return null;
    }
};
export const fetchPoints = async (search = '', page = '1', per_page, sort_by = 'createdAt', sort_order = 'asc') => {
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
    return data.data;
};
export const fetchPointByUuid = async (uuid) => {
    const response = await fetch(`/api/points/${uuid}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch point with UUID: ${uuid}`);
    }
    const data = await response.json();
    return data.data.point;
};
export const fetchPointsByUuids = async (uuids) => {
    const promises = uuids.map(fetchPointByUuid);
    return Promise.all(promises);
};
export const fetchAdditionalServices = async () => {
    const url = '/api/additional-services?page=1&per_page=100';
    const data = await fetchData(url);
    return data.data.additionalServices || [];
};
export const fetchDrivers = async (serviceLevel, vehicleType, searchQuery, page = '1', per_page = '10') => {
    const params = new URLSearchParams({
        ...(serviceLevel && { serviceLevel }),
        ...(vehicleType && { vehicleType }),
        ...(searchQuery && { search: searchQuery }),
        ...(page && { page }),
        ...(per_page && { per_page }),
    });
    const response = await fetch(`/api/orders/drivers?${params}`);
    const data = await response.json();
    return data.data;
};
//Запрос назначенного водителя
export const fetchAssignedDriver = async (assignedDriverId) => {
    const params = new URLSearchParams({ assignedDriverId });
    const response = await fetch(`/api/orders/drivers?${params}`);
    const data = await response.json();
    return data.data.driver;
};
export const fetchTariffs = async (serviceLevel, vehicleType) => {
    let url = '/api/tariffs';
    const params = new URLSearchParams();
    if (serviceLevel)
        params.append('serviceLevel', serviceLevel);
    if (vehicleType)
        params.append('vehicleType', vehicleType);
    if (params.toString())
        url += `?${params.toString()}`;
    const data = await fetchData(url);
    return data.data.tariffs || [];
};
