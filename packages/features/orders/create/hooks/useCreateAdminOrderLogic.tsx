import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  ServiceLevels,
  VehicleType,
  Tariff,
  TariffOnService,
  OrderOnTariffAdditionalService,
  User,
} from '@prisma/client';
import { TariffWithServices } from '@pages/(administrator)/orders/create/OrderCreate.view';

export interface FormOrderValues {
  createdBy: string;
  tariffUuid: string;
  departurePoint: string;
  arrivalPoint: string;
  serviceLevel: ServiceLevels;
  vehicleType: VehicleType;
  flightNumber: string;
  description: string;
  intermediatePoints: string[];
  selectedServices: string[];
  departureTime: string;
  basePrice: number;
  waitingTimeMinutes: number;
  assignedDriverId: string;
}

type SafeUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone'>;

interface OrderData {
  uuid: string;
  createdBy: SafeUser;
  tariff: Pick<Tariff, 'uuid' | 'name' | 'serviceLevel' | 'vehicleType'> & {
    tariffAdditionalServices: (TariffOnService & {
      orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
    })[];
  };
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  departureTime?: string;
}

const useCreateAdminOrderLogic = (
  tariffs: TariffWithServices[],
  initialServiceLevel: ServiceLevels | undefined,
  initialVehicleType: VehicleType | undefined,
  orderData?: OrderData | null,
) => {
  const formMethods: UseFormReturn<FormOrderValues> = useForm<FormOrderValues>({
    mode: 'onBlur',
    defaultValues: {
      createdBy: orderData?.createdBy?.uuid || '',
      tariffUuid: orderData?.tariff.uuid || '',
      departurePoint: orderData?.departurePoint.address || '',
      arrivalPoint: orderData?.arrivalPoint.address || '',
      serviceLevel: initialServiceLevel || ServiceLevels.Basic,
      vehicleType: initialVehicleType || VehicleType.Sedan,
      flightNumber: '',
      description: '',
      intermediatePoints: [],
      selectedServices: orderData?.tariff.tariffAdditionalServices.map((s) => s.uuid) || [],
      departureTime: orderData?.departureTime || new Date().toISOString().slice(0, 16),
      basePrice: 0,
      waitingTimeMinutes: 0,
    },
  });

  const { watch, setValue, getValues } = formMethods;

  const selectedServiceLevel = watch('serviceLevel');
  const selectedVehicleType = watch('vehicleType');

  const [selectedTariff, setSelectedTariff] = useState<TariffWithServices | null>(null);
  const serviceLevelMapRef = useRef<Partial<Record<VehicleType, ServiceLevels>>>({});

  useEffect(() => {
    if (selectedServiceLevel && selectedVehicleType && tariffs.length > 0) {
      const matchingTariff = tariffs.find(
        (tariff) =>
          tariff.serviceLevel === selectedServiceLevel &&
          tariff.vehicleType === selectedVehicleType,
      );
      setSelectedTariff(matchingTariff || null);
      if (matchingTariff) {
        setValue('tariffUuid', matchingTariff.uuid);
      }
    } else {
      setSelectedTariff(null);
    }
  }, [selectedServiceLevel, selectedVehicleType, tariffs, setValue]);

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

  const handleVehicleTypeChange = useCallback(
    (newType: VehicleType) => {
      const currentVehicleType = getValues('vehicleType');
      const currentServiceLevel = getValues('serviceLevel');
      if (currentVehicleType && currentServiceLevel) {
        serviceLevelMapRef.current[currentVehicleType] = currentServiceLevel;
      }
      setValue('vehicleType', newType);
      const savedServiceLevel = serviceLevelMapRef.current[newType];
      setValue('serviceLevel', savedServiceLevel ?? ServiceLevels.Basic);
    },
    [setValue, getValues],
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
