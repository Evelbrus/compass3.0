import { useState, useEffect, useMemo, useRef } from 'react';
import { AdditionalService } from '@prisma/client';
import {
  OrderData,
  TariffWithServices,
} from '@pages/(administrator)/orders/create/OrderCreate.view';

const useAdditionalServices = (
  selectedTariff: TariffWithServices | null,
  allServices: AdditionalService[],
  orderData?: OrderData | null,
) => {
  const initialSelectedServices = orderData?.selectedServices?.length
    ? [...orderData.selectedServices]
    : [];

  const [selectedServices, setSelectedServices] = useState<string[]>(initialSelectedServices);
  const initializedRef = useRef<boolean>(false);

  // Инициализация при первом совпадении тарифа
  useEffect(() => {
    if (!selectedTariff || !orderData || initializedRef.current) return;

    const currentTariffUuid = selectedTariff.uuid;
    if (orderData.tariff?.uuid === currentTariffUuid && orderData.selectedServices.length > 0) {
      setSelectedServices(orderData.selectedServices);
      initializedRef.current = true;
    }
  }, [selectedTariff, orderData]);

  const availableServices = useMemo(() => {
    const tariffServiceMap = new Map<
      string,
      { price: number; isAvailable: boolean; uuid: string }
    >();

    if (selectedTariff && selectedTariff.tariffAdditionalServices) {
      selectedTariff.tariffAdditionalServices.forEach((ts) => {
        tariffServiceMap.set(ts.serviceUuid, {
          price: ts.price,
          isAvailable: ts.isAvailable,
          uuid: ts.uuid,
        });
      });
    }

    return allServices.map((service) => {
      const tariffService = tariffServiceMap.get(service.uuid);
      return {
        service,
        price: tariffService?.price || 0,
        isAvailable: !!tariffService?.isAvailable,
        tariffOnServiceUuid: tariffService?.uuid || null,
      };
    });
  }, [allServices, selectedTariff]);

  const handleServiceSelection = (serviceUuid: string, _price: number, isAvailable: boolean) => {
    if (!isAvailable || !selectedTariff) return;

    const tariffService = selectedTariff.tariffAdditionalServices?.find(
      (s) => s.serviceUuid === serviceUuid,
    );

    if (!tariffService) return;

    setSelectedServices((prev) => {
      const isAlreadySelected = prev.includes(tariffService.uuid);
      if (isAlreadySelected) {
        return prev.filter((uuid) => uuid !== tariffService.uuid);
      }
      return [...prev, tariffService.uuid];
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
  };
};

export default useAdditionalServices;
