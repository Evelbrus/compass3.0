import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAdditionalServices } from '@features/orders/create/hooks';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { UseFormWatch } from 'react-hook-form';

export interface SelectedAdditionalService {
  uuid: string;
  name: string;
  price: number;
}

export interface SelectedServicesState {
  [serviceLevel: string]: {
    [tariffUuid: string]: SelectedAdditionalService[];
  };
}

interface UseOrderCreateAdditionalServicesProps {
  watch: UseFormWatch<CreateOrderData>;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
  selectedTariff: ExtendedTariff | null;
  orderTariffAdditionalServices?: {
    serviceUuid: string;
    name: string;
    price: number;
  }[];
}

//Общий тип для элементов, участвующих в сортировке
type SortableService = {
  name: string;
};

export const useOrderCreateAdditionalServices = ({
  setErrorMessage,
  selectedTariff,
  orderTariffAdditionalServices,
}: UseOrderCreateAdditionalServicesProps) => {
  const { additionalServices: unsortedAdditionalServices } = useAdditionalServices({
    setErrorMessage,
  });

  //Сортируем additionalServices при получении
  const additionalServices = useMemo(() => {
    return [...unsortedAdditionalServices].sort((a: SortableService, b: SortableService) =>
      a.name.localeCompare(b.name),
    );
  }, [unsortedAdditionalServices]);

  const [selectedServicesState, setSelectedServicesState] = useState<SelectedServicesState>({});

  const selectedAdditionalServices = useMemo(() => {
    if (!selectedTariff) return [];
    const { serviceLevel, uuid: tariffUuid } = selectedTariff;
    return selectedServicesState[serviceLevel]?.[tariffUuid] || [];
  }, [selectedServicesState, selectedTariff]);

  const initialized = useRef(false);

  useEffect(() => {
    if (!selectedTariff) return;
    const { serviceLevel, uuid: tariffUuid } = selectedTariff;

    if (!initialized.current) {
      initialized.current = true;
      if (orderTariffAdditionalServices && orderTariffAdditionalServices.length > 0) {
        setSelectedServicesState((prevState) => {
          const updatedState: SelectedServicesState = {
            ...prevState,
            [serviceLevel]: {
              ...(prevState[serviceLevel] || {}),
              [tariffUuid]: orderTariffAdditionalServices.map((service) => ({
                uuid: service.serviceUuid,
                name: service.name,
                price: service.price,
              })),
            },
          };
          return updatedState;
        });
      } else {
        setSelectedServicesState((prevState) => ({
          ...prevState,
          [serviceLevel]: {
            ...(prevState[serviceLevel] || {}),
            [tariffUuid]: [],
          },
        }));
      }
    }
  }, [selectedTariff, orderTariffAdditionalServices]);

  const handleAdditionalServiceChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, serviceUuid: string) => {
      if (!selectedTariff) return;
      const { serviceLevel, uuid: tariffUuid } = selectedTariff;

      setSelectedServicesState((prev) => {
        const prevServices = prev[serviceLevel]?.[tariffUuid] || [];

        if (e.target.checked) {
          const service = selectedTariff.tariffAdditionalServices?.find(
            (s) => s.uuid === serviceUuid && s.isAvailable,
          );

          if (service) {
            const existingServiceIndex = prevServices.findIndex((s) => s.uuid === serviceUuid);

            if (existingServiceIndex >= 0) {
              const updatedServices = prevServices.map((s) =>
                s.uuid === serviceUuid ? { ...s, price: service.price } : s,
              );

              return {
                ...prev,
                [serviceLevel]: {
                  ...(prev[serviceLevel] || {}),
                  [tariffUuid]: updatedServices,
                },
              };
            } else {
              const newService = {
                uuid: serviceUuid,
                name: service.name,
                price: service.price,
              };

              return {
                ...prev,
                [serviceLevel]: {
                  ...(prev[serviceLevel] || {}),
                  [tariffUuid]: [...prevServices, newService],
                },
              };
            }
          } else {
            return prev;
          }
        } else {
          const updatedServices = prevServices.filter((s) => s.uuid !== serviceUuid);

          return {
            ...prev,
            [serviceLevel]: {
              ...(prev[serviceLevel] || {}),
              [tariffUuid]: updatedServices,
            },
          };
        }
      });
    },
    [selectedTariff],
  );

  const getSelectedAdditionalServicesInfo = useCallback(() => {
    if (!selectedTariff || !selectedTariff.tariffAdditionalServices) {
      return { count: 0, totalPrice: 0 };
    }

    const { serviceLevel, uuid: tariffUuid } = selectedTariff;
    const currentServices = selectedServicesState[serviceLevel]?.[tariffUuid] || [];

    const selected = currentServices.filter((selectedService) => {
      return selectedTariff.tariffAdditionalServices!.some(
        (tariffService) => tariffService.uuid === selectedService.uuid,
      );
    });

    const totalPrice = selected.reduce((acc, service) => {
      const foundService = selectedTariff.tariffAdditionalServices!.find(
        (tariffService) => tariffService.uuid === service.uuid,
      );
      return acc + (foundService ? foundService.price : 0);
    }, 0);

    return {
      count: selected.length,
      totalPrice,
    };
  }, [selectedServicesState, selectedTariff]);

  const selectedServicesInfo = useMemo(() => {
    return () => {
      return getSelectedAdditionalServicesInfo();
    };
  }, [getSelectedAdditionalServicesInfo]);

  const additionalServicesLabel = useMemo(() => {
    return () => {
      const { count, totalPrice } = selectedServicesInfo();

      return `(${count} опций ${totalPrice}с)`;
    };
  }, [selectedServicesInfo]);

  const totalServicesPrice = useMemo(() => {
    if (!selectedTariff) return 0;
    const { serviceLevel, uuid: tariffUuid } = selectedTariff;
    const currentServices = selectedServicesState[serviceLevel]?.[tariffUuid] || [];
    return currentServices.reduce((acc, service) => acc + service.price, 0);
  }, [selectedServicesState, selectedTariff]);

  const combinedServices = useMemo(() => {
    if (!additionalServices) {
      return [];
    }

    if (!selectedTariff) {
      return additionalServices.map((service) => ({
        uuid: service.uuid,
        name: service.name,
        price: 0,
        isAvailable: false,
        serviceUuid: service.uuid,
        tariffUuid: null,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        service: service,
      }));
    }

    const tariffServices =
      selectedTariff.tariffAdditionalServices?.map((ts) => {
        const service = additionalServices.find((s) => s.uuid === ts.serviceUuid);
        return {
          ...ts,
          service: service || {
            uuid: '',
            name: 'Service Not Found',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      }) || [];

    //Добавляем сервисы, которые есть в additionalServices, но отсутствуют в tariffServices
    const additionalServicesNotInTariff = additionalServices
      .filter((service) => !tariffServices.find((ts) => ts.serviceUuid === service.uuid))
      .map((service) => ({
        uuid: service.uuid,
        name: service.name,
        price: 0,
        isAvailable: false,
        serviceUuid: service.uuid,
        tariffUuid: selectedTariff.uuid,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        service: service,
      }));

    return [...tariffServices, ...additionalServicesNotInTariff].sort(
      (a: { service: SortableService }, b: { service: SortableService }) =>
        a.service.name.localeCompare(b.service.name),
    );
  }, [selectedTariff, additionalServices]);

  return {
    additionalServices,
    selectedAdditionalServices,
    handleAdditionalServiceChangeCallback,
    availableAdditionalServices: combinedServices,
    additionalServicesLabel,
    totalServicesPrice,
    selectedServicesState,
  };
};
