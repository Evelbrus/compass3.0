import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ServiceLevels, VehicleType, Tariff, TariffOnService, Point, Order } from '@prisma/client';
import {
  OrderData,
  TariffWithServices,
} from '@pages/(administrator)/orders/create/OrderCreate.view';

export interface FormOrderValues {
  createdBy: Pick<Order, 'uuid'>;
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
  assignedDriverId: Pick<Order, 'assignedDriverId'>;
  fullName?: string;
  phone?: string;
}

const useCreateAdminOrderLogic = (tariffs: TariffWithServices[], orderData?: OrderData | null) => {
  const initialServiceLevel = orderData?.tariff?.serviceLevel || ServiceLevels.Basic;
  const initialVehicleType = orderData?.tariff?.vehicleType || VehicleType.Sedan;

  const formMethods: UseFormReturn<FormOrderValues> = useForm<FormOrderValues>({
    mode: 'onBlur',
    defaultValues: {
      createdBy: orderData?.createdBy ? { uuid: orderData.createdBy.uuid } : undefined,
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
    },
  });

  const { watch, setValue, getValues } = formMethods;

  const selectedServiceLevel = watch('serviceLevel');
  const selectedVehicleType = watch('vehicleType');

  const [selectedTariff, setSelectedTariff] = useState<TariffWithServices | null>(null);
  const serviceLevelMapRef = useRef<Partial<Record<VehicleType, ServiceLevels>>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && initialVehicleType && initialServiceLevel) {
      serviceLevelMapRef.current[initialVehicleType] = initialServiceLevel;
      initializedRef.current = true;
    }
  }, [initialVehicleType, initialServiceLevel]);

  useEffect(() => {
    if (selectedServiceLevel && selectedVehicleType && tariffs.length > 0) {
      const matchingTariff = tariffs.find(
        (tariff) =>
          tariff.serviceLevel === selectedServiceLevel &&
          tariff.vehicleType === selectedVehicleType,
      );
      setSelectedTariff(matchingTariff || null);
      if (matchingTariff) {
        setValue('tariffUuid', { uuid: matchingTariff.uuid });
      }
    } else {
      setSelectedTariff(null);
    }
  }, [selectedServiceLevel, selectedVehicleType, tariffs, setValue]);

  useEffect(() => {
    if (tariffs.length > 0 && orderData?.tariff && !initializedRef.current) {
      initializedRef.current = true;
      const initialTariff = tariffs.find((t) => t.uuid === orderData.tariff.uuid);
      if (initialTariff) {
        setValue('serviceLevel', initialTariff.serviceLevel);
        setValue('vehicleType', initialTariff.vehicleType);
        setValue('tariffUuid', { uuid: initialTariff.uuid });
        setSelectedTariff(initialTariff);
        serviceLevelMapRef.current[initialTariff.vehicleType] = initialTariff.serviceLevel;
      } else {
        console.log('Не найден тариф с UUID:', orderData.tariff.uuid);
      }
    }
  }, [tariffs, orderData, setValue]);

  const handleServiceLevelChange = useCallback(
    (level: ServiceLevels) => {
      setValue('serviceLevel', level);
      const currentVehicleType = getValues('vehicleType');
      if (currentVehicleType) {
        serviceLevelMapRef.current[currentVehicleType] = level;
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
      const currentVehicleType = getValues('vehicleType');
      const currentServiceLevel = getValues('serviceLevel');

      if (currentVehicleType && currentServiceLevel) {
        serviceLevelMapRef.current[currentVehicleType] = currentServiceLevel;
      }

      setValue('vehicleType', newType);

      const availableTariffs = getAvailableTariffsForVehicleType(newType);
      if (availableTariffs.length > 0 && availableTariffs[0]) {
        const firstAvailableTariff = availableTariffs[0];
        const newServiceLevel = firstAvailableTariff.serviceLevel;
        setValue('serviceLevel', newServiceLevel);
        serviceLevelMapRef.current[newType] = newServiceLevel;
        setValue('tariffUuid', { uuid: firstAvailableTariff.uuid });
      } else {
        const savedServiceLevel = serviceLevelMapRef.current[newType];
        if (savedServiceLevel) {
          setValue('serviceLevel', savedServiceLevel);
        }
      }
    },
    [setValue, getValues, getAvailableTariffsForVehicleType],
  );

  return {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  };
};

export default useCreateAdminOrderLogic;
