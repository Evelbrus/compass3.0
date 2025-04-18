import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  ServiceLevels,
  VehicleType,
  Tariff,
  TariffOnService,
  Point,
  Order,
  OrderStatus,
} from '@prisma/client';
import { OrderData } from '@features/orders/create/types/types';

export interface FormOrderValues {
  clientBy: Pick<Order, 'uuid'>;
  tariffUuid: Pick<Tariff, 'uuid'> | null;
  departurePoint: Pick<Point, 'uuid'> | null;
  arrivalPoint: Pick<Point, 'uuid'> | null;
  serviceLevel: ServiceLevels;
  vehicleType: VehicleType;
  flightNumber: Pick<Order, 'flightNumber'>;
  description: Pick<Order, 'description'>;
  intermediatePoints: (Pick<Point, 'uuid'> | null)[];
  selectedServices: TariffOnService[];
  departureTime: Date | undefined;
  basePrice: Pick<Order, 'basePrice'>;
  waitingTimeMinutes: Pick<Order, 'waitingTimeMinutes'>;
  assignedDriverId: string | null;
  fullName?: string;
  phone?: string;
  status: OrderStatus;
}

export const useCreateAdminOrderLogic = (
  tariffs: (Tariff & { tariffAdditionalServices: TariffOnService[] })[],
  orderData?: OrderData | null,
) => {
  const initialServiceLevel = orderData?.tariff?.serviceLevel || ServiceLevels.Basic;
  const initialVehicleType = orderData?.tariff?.vehicleType || VehicleType.Sedan;

  const formMethods: UseFormReturn<FormOrderValues> = useForm<FormOrderValues>({
    mode: 'onBlur',
    defaultValues: {
      clientBy: orderData?.clientBy ? { uuid: orderData.clientBy.uuid } : undefined,
      tariffUuid: orderData?.tariff ? { uuid: orderData.tariff.uuid } : null,
      departurePoint: orderData?.departurePoint || null,
      arrivalPoint: orderData?.arrivalPoint || null,
      intermediatePoints: orderData?.intermediatePoints
        ? [
            ...orderData.intermediatePoints,
            ...Array(5 - (orderData.intermediatePoints.length || 0)).fill(null),
          ]
        : Array(5).fill(null),
      serviceLevel: initialServiceLevel,
      vehicleType: initialVehicleType,
      departureTime: orderData?.departureTime ? new Date(orderData.departureTime) : undefined,
      description: orderData?.description
        ? { description: orderData.description }
        : { description: null },
      flightNumber: orderData?.flightNumber
        ? { flightNumber: orderData.flightNumber }
        : { flightNumber: null },
      fullName: '',
      phone: '',
      status: orderData?.status,
    },
  });

  const { watch, setValue, getValues } = formMethods;

  const selectedServiceLevel = watch('serviceLevel');
  const selectedVehicleType = watch('vehicleType');

  const serviceLevelMapRef = useRef<Partial<Record<VehicleType, ServiceLevels>>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && initialVehicleType && initialServiceLevel) {
      serviceLevelMapRef.current[initialVehicleType] = initialServiceLevel;
      initializedRef.current = true;
    }
  }, [initialVehicleType, initialServiceLevel]);

  useEffect(() => {
    console.log('[useEffect] selectedServiceLevel:', selectedServiceLevel);
    console.log('[useEffect] selectedVehicleType:', selectedVehicleType);
    console.log('[useEffect] tariffs:', tariffs.map(t => ({ uuid: t.uuid, serviceLevel: t.serviceLevel, vehicleType: t.vehicleType })));
    if (selectedServiceLevel && selectedVehicleType && tariffs.length > 0) {
      const matchingTariff = tariffs.find(
        (tariff) =>
          tariff.serviceLevel === selectedServiceLevel &&
          tariff.vehicleType === selectedVehicleType,
      );
      console.log('[useEffect] matchingTariff:', matchingTariff);
    }
  }, [selectedServiceLevel, selectedVehicleType, tariffs]);

  useEffect(() => {
    if (tariffs.length > 0 && orderData?.tariff && !initializedRef.current) {
      initializedRef.current = true;
      const initialTariff = tariffs.find((t) => t.uuid === orderData.tariff.uuid);
      if (initialTariff) {
        if (getValues('serviceLevel') !== initialTariff.serviceLevel) {
          setValue('serviceLevel', initialTariff.serviceLevel);
        }
        if (getValues('vehicleType') !== initialTariff.vehicleType) {
          setValue('vehicleType', initialTariff.vehicleType);
        }
        serviceLevelMapRef.current[initialTariff.vehicleType] = initialTariff.serviceLevel;
      }
    }
  }, [tariffs, orderData, setValue, getValues]);

  const handleServiceLevelChange = useCallback(
    (level: ServiceLevels) => {
      if (getValues('serviceLevel') !== level) {
        setValue('serviceLevel', level);
        const currentVehicleType = getValues('vehicleType');
        if (currentVehicleType) {
          serviceLevelMapRef.current[currentVehicleType] = level;
        }
      }
    },
    [setValue, getValues],
  );

  const getAvailableTariffsForVehicleType = useCallback(
    (vehicleType: VehicleType) => {
      return tariffs.filter((tariff) => tariff.vehicleType === vehicleType);
    },
    [tariffs],
  );

  const handleVehicleTypeChange = useCallback(
    (newType: VehicleType) => {
      if (getValues('vehicleType') !== newType) {
        const currentVehicleType = getValues('vehicleType');
        const currentServiceLevel = getValues('serviceLevel');

        if (currentVehicleType && currentServiceLevel) {
          serviceLevelMapRef.current[currentVehicleType] = currentServiceLevel;
        }

        setValue('vehicleType', newType);

        const availableTariffs = getAvailableTariffsForVehicleType(newType);
        const hasCurrentServiceLevel = availableTariffs.some(
          (tariff) => tariff.serviceLevel === currentServiceLevel
        );
        if (hasCurrentServiceLevel) {
          if (getValues('serviceLevel') !== currentServiceLevel) {
            setValue('serviceLevel', currentServiceLevel);
          }
          const matchingTariff = availableTariffs.find(
            (tariff) => tariff.serviceLevel === currentServiceLevel
          );
          if (matchingTariff && getValues('tariffUuid')?.uuid !== matchingTariff.uuid) {
            setValue('tariffUuid', { uuid: matchingTariff.uuid });
          }
        } else if (availableTariffs.length > 0) {
          const firstAvailableTariff = availableTariffs[0];
          if (firstAvailableTariff) {
            const newServiceLevel = firstAvailableTariff.serviceLevel;
            if (getValues('serviceLevel') !== newServiceLevel) {
              setValue('serviceLevel', newServiceLevel);
            }
            serviceLevelMapRef.current[newType] = newServiceLevel;
            if (getValues('tariffUuid')?.uuid !== firstAvailableTariff.uuid) {
              setValue('tariffUuid', { uuid: firstAvailableTariff.uuid });
            }
          }
        } else {
          const savedServiceLevel = serviceLevelMapRef.current[newType];
          if (savedServiceLevel && getValues('serviceLevel') !== savedServiceLevel) {
            setValue('serviceLevel', savedServiceLevel);
          }
        }
      }
    },
    [setValue, getValues, getAvailableTariffsForVehicleType],
  );

  // Производное значение тарифа
  const selectedTariff = tariffs.find(
    (tariff) =>
      tariff.serviceLevel === selectedServiceLevel &&
      tariff.vehicleType === selectedVehicleType,
  ) || null;

  // Производное значение tariffUuid
  const selectedTariffUuid = selectedTariff?.uuid || null;

  return {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    selectedTariffUuid,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  };
};
