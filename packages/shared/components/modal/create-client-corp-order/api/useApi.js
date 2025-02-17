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
