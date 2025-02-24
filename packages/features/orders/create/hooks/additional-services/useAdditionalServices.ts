import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchAdditionalServices } from '@features/orders/create/api/orders.api';
import {
  AdditionalService,
} from '@prisma/client';
import { TariffWithServices } from '@pages/(administrator)/orders/create/OrderCreate.view';

const useAdditionalServices = (selectedTariff: TariffWithServices | null) => {
  const [allServices, setAllServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServicesMap, setSelectedServicesMap] = useState<Record<string, string[]>>({});
  const prevTariffRef = useRef<TariffWithServices | null>(null);
  const prevSelectedServicesRef = useRef<string[]>(selectedServices);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const services = await fetchAdditionalServices();
        setAllServices(services);
      } catch (err: unknown) {
        console.error('Failed to fetch additional services:', err);
        if (err instanceof Error) {
          setError(err.message || 'Не удалось загрузить дополнительные услуги');
        } else {
          setError('Не удалось загрузить дополнительные услуги');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    prevSelectedServicesRef.current = selectedServices;
  }, [selectedServices]);

  useEffect(() => {
    if (prevTariffRef.current && prevTariffRef.current.uuid) {
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

    if (selectedTariff && selectedTariff.uuid) {
      const newUuid = selectedTariff.uuid;
      setSelectedServices(selectedServicesMap[newUuid] || []);
    } else {
      setSelectedServices([]);
    }
  }, [selectedTariff, selectedServicesMap]);

  const availableServices = useMemo(() => {
    if (!selectedTariff) {
      return allServices.map((service) => ({
        service,
        price: 0,
        isAvailable: false,
        tariffOnServiceUuid: null,
      }));
    }

    const tariffServiceMap = new Map<
      string,
      { price: number; isAvailable: boolean; uuid: string }
    >();
    selectedTariff.tariffAdditionalServices?.forEach((ts) => {
      tariffServiceMap.set(ts.serviceUuid, {
        price: ts.price,
        isAvailable: ts.isAvailable,
        uuid: ts.uuid,
      });
    });

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

  const handleServiceSelection = (serviceUuid: string, price: number, isAvailable: boolean) => {
    if (!isAvailable || !selectedTariff) return;

    const tariffService = selectedTariff.tariffAdditionalServices?.find(
      (service) => service.serviceUuid === serviceUuid,
    );
    if (!tariffService) return;

    setSelectedServices((prev) => {
      const isAlreadySelected = prev.includes(tariffService.uuid);
      if (isAlreadySelected) {
        return prev.filter((uuid) => uuid !== tariffService.uuid);
      } else {
        return [...prev, tariffService.uuid];
      }
    });
  };

  const totalAdditionalServicesPrice = useMemo(() => {
    return selectedServices.reduce((total, uuid) => {
      const info = availableServices.find((item) => item.tariffOnServiceUuid === uuid);
      return total + (info && info.isAvailable ? info.price : 0);
    }, 0);
  }, [selectedServices, availableServices]);

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
