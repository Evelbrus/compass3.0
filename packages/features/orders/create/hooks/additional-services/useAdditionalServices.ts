import { useState, useEffect, useMemo, useRef } from 'react';
import {
  AdditionalService,
  Tariff,
  TariffOnService,
} from '@prisma/client';
import { OrderData } from '@features/orders/create/types/types';

export const useAdditionalServices = (
  selectedTariff: (Tariff & { tariffAdditionalServices: TariffOnService[] }) | null,
  allServices: AdditionalService[],
  orderData?: OrderData | null,
) => {
  const initialSelectedServices = useMemo(() => {
    if (!orderData?.selectedServices?.length || !selectedTariff) return [];
    return selectedTariff.tariffAdditionalServices.filter((service) =>
      orderData.selectedServices.some((item) => item.uuid === service.uuid),
    );
  }, [orderData, selectedTariff]);

  const [selectedServices, setSelectedServices] =
    useState<TariffOnService[]>(initialSelectedServices);
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!selectedTariff || !orderData || initializedRef.current) return;

    const currentTariffUuid = selectedTariff.uuid;
    if (orderData.tariff?.uuid === currentTariffUuid && orderData.selectedServices.length > 0) {
      const initialServices = selectedTariff.tariffAdditionalServices.filter((service) =>
        orderData.selectedServices.some((item) => item.uuid === service.uuid),
      );
      setSelectedServices(initialServices);
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
      const isAlreadySelected = prev.some((s) => s.uuid === tariffService.uuid);
      if (isAlreadySelected) {
        return prev.filter((s) => s.uuid !== tariffService.uuid);
      }
      return [...prev, tariffService];
    });
  };

  const totalAdditionalServicesPrice = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      return total + (service.isAvailable ? service.price : 0);
    }, 0);
  }, [selectedServices]);

  return {
    availableServices,
    selectedServices,
    handleServiceSelection,
    totalAdditionalServicesPrice,
  };
};
