import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchAdditionalServices } from '@shared/components/modal/create-client-corp-order/api/useApi';
const useAdditionalServices = (selectedTariff) => {
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAdditionalServicesPrice, setTotalAdditionalServicesPrice] = useState(0);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedServicesMap, setSelectedServicesMap] = useState({});
    const prevTariffRef = useRef(null);
    const prevSelectedServicesRef = useRef(selectedServices);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const services = await fetchAdditionalServices();
                setAllServices(services);
            }
            catch (err) {
                console.error('Failed to fetch additional services:', err);
                //Проверяем, является ли err экземпляром Error
                if (err instanceof Error) {
                    setError(err.message || 'Не удалось загрузить дополнительные услуги');
                }
                else {
                    setError('Не удалось загрузить дополнительные услуги');
                }
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        prevSelectedServicesRef.current = selectedServices;
    }, [selectedServices]);
    useEffect(() => {
        if (prevTariffRef.current && prevTariffRef.current.uuid != null) {
            const prevUuid = prevTariffRef.current.uuid;
            const newUuid = selectedTariff?.uuid ?? null;
            if (prevUuid !== newUuid) {
                setSelectedServicesMap((prevMap) => ({
                    ...prevMap,
                    [prevUuid]: prevSelectedServicesRef.current,
                }));
            }
        }
        prevTariffRef.current = selectedTariff;
        if (selectedTariff && selectedTariff.uuid != null) {
            const newUuid = selectedTariff.uuid;
            if (selectedServicesMap.hasOwnProperty(newUuid)) {
                setSelectedServices(selectedServicesMap[newUuid]);
            }
            else {
                setSelectedServices([]);
            }
        }
        else {
            setSelectedServices([]);
        }
    }, [selectedTariff, selectedServicesMap]);
    const availableServices = useMemo(() => {
        //Если тариф не выбран, показываем все услуги как недоступные.
        if (!selectedTariff) {
            return allServices.map((service) => ({
                service,
                price: 0,
                isAvailable: false,
                tariffOnServiceUuid: null,
            }));
        }
        //Создаем Map для быстрого поиска.
        const tariffServiceMap = new Map();
        selectedTariff.tariffAdditionalServices?.forEach((ts) => {
            tariffServiceMap.set(ts.serviceUuid, ts);
        });
        //Для каждого сервиса из общего списка ищем информацию в Map.
        return allServices.map((service) => {
            const tariffService = tariffServiceMap.get(service.uuid);
            return {
                service,
                price: tariffService?.price || 0,
                isAvailable: tariffService?.isAvailable || false,
                tariffOnServiceUuid: tariffService?.uuid || null,
            };
        });
    }, [allServices, selectedTariff]);
    useEffect(() => {
        let newTotalPrice = 0;
        selectedServices.forEach((tariffOnServiceUuid) => {
            const info = availableServices.find((item) => item.tariffOnServiceUuid === tariffOnServiceUuid);
            if (info?.isAvailable) {
                newTotalPrice += info.price;
            }
        });
        setTotalAdditionalServicesPrice(newTotalPrice);
    }, [selectedServices, availableServices]);
    const handleServiceSelection = (serviceUuid, price, isAvailable) => {
        if (!isAvailable || !selectedTariff)
            return;
        const tariffService = selectedTariff.tariffAdditionalServices?.find((service) => service.serviceUuid === serviceUuid);
        if (!tariffService)
            return;
        setSelectedServices((prev) => {
            const isAlreadySelected = prev.includes(tariffService.uuid);
            if (isAlreadySelected) {
                setTotalAdditionalServicesPrice((prevPrice) => prevPrice - tariffService.price);
                return prev.filter((uuid) => uuid !== tariffService.uuid);
            }
            else {
                setTotalAdditionalServicesPrice((prevPrice) => prevPrice + tariffService.price);
                return [...prev, tariffService.uuid];
            }
        });
    };
    return {
        availableServices,
        selectedServices,
        handleServiceSelection,
        totalAdditionalServicesPrice,
        loading,
        error,
    };
};
export default useAdditionalServices;
