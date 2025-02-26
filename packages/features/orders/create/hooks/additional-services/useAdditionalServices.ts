import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchAdditionalServices } from '@features/orders/create/api/orders.api';
import { AdditionalService } from '@prisma/client';
import { TariffWithServices } from '@pages/(administrator)/orders/create/OrderCreate.view';

const useAdditionalServices = (selectedTariff: TariffWithServices | null, orderData?: any) => {
  // Инициализация selectedServices из orderData с самого начала
  const initialSelectedServices =
    orderData?.selectedServices?.length > 0 ? [...orderData.selectedServices] : [];

  const [allServices, setAllServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialSelectedServices);
  const [selectedServicesMap, setSelectedServicesMap] = useState<Record<string, string[]>>({});

  const prevTariffRef = useRef<string | null>(null);
  const prevSelectedServicesRef = useRef<string[]>(initialSelectedServices);
  const initializedRef = useRef<boolean>(initialSelectedServices.length > 0);
  const updatesCountRef = useRef<number>(0);

  // Загрузка всех дополнительных услуг
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

  // Сохраняем выбранные услуги при их изменении
  useEffect(() => {
    prevSelectedServicesRef.current = selectedServices;
  }, [selectedServices]);

  // Обработка изменения тарифа - с защитой от слишком частых обновлений
  useEffect(() => {
    const currentTariffUuid = selectedTariff?.uuid || null;
    const prevTariffUuid = prevTariffRef.current;

    // Проверяем, изменился ли тариф
    const isTariffChanged = currentTariffUuid !== prevTariffUuid;

    // Если ничего не изменилось, выходим
    if (!isTariffChanged) {
      return;
    }

    // Если слишком много обновлений в одном рендере, пропускаем
    updatesCountRef.current += 1;
    if (updatesCountRef.current > 5) {
      console.warn('Слишком много обновлений тарифа, пропускаем', updatesCountRef.current);
      prevTariffRef.current = currentTariffUuid;
      return;
    }

    // Сохраняем выбранные услуги для предыдущего тарифа
    if (prevTariffUuid && prevSelectedServicesRef.current.length > 0) {
      setSelectedServicesMap((prev) => ({
        ...prev,
        [prevTariffUuid]: [...prevSelectedServicesRef.current],
      }));
    }

    // Обновляем ссылку на текущий тариф
    prevTariffRef.current = currentTariffUuid;

    // Если тариф стал null, очищаем выбранные услуги
    if (!currentTariffUuid) {
      setSelectedServices([]);
      return;
    }

    // Если мы в режиме редактирования и это первая инициализация
    if (
      orderData &&
      orderData.selectedServices &&
      orderData.selectedServices.length > 0 &&
      orderData.tariff?.uuid === currentTariffUuid &&
      !initializedRef.current
    ) {
      setSelectedServices(orderData.selectedServices);
      initializedRef.current = true;
    }
    // Если у нас есть сохраненные услуги для этого тарифа
    else if (
      selectedServicesMap[currentTariffUuid] &&
      selectedServicesMap[currentTariffUuid].length > 0
    ) {
      setSelectedServices(selectedServicesMap[currentTariffUuid]);
    }
    // Если нет сохраненных услуг - сбрасываем выбор
    else {
      setSelectedServices([]);
    }

    // Планируем сброс счетчика обновлений
    setTimeout(() => {
      updatesCountRef.current = 0;
    }, 500);
  }, [selectedTariff, orderData]);

  // Подготавливаем доступные услуги для отображения
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

  // Обработка выбора/отмены выбора услуги
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

  // Расчет общей стоимости выбранных дополнительных услуг
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
