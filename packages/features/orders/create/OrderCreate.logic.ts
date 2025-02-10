import { useForm, UseFormSetValue } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { useErrorMessage } from '@features/orders/create/functions/useErrorMessage';
import {
  useNotifications,
  useOrderCreateClients,
  useOrderCreateDrivers,
  useOrderConfiguration,
  useOrderCreatePoints,
  useOrderTime,
  useOrderCreateAdditionalServices,
  useOrderPriceCalculation,
} from '@features/orders/create/hooks';
import { cleanIntermediatePoints } from '@features/orders/create/helpers';
import { showToast } from '@shared/components/toast/ToastManager';
import { useEffect, useState } from 'react';
import { Point, Status, Tariff } from '@prisma/client';
import { useRouter } from 'next/navigation';

export interface OrderData {
  assignedDriverId: string | null;
  departurePoint: string;
  createdBy: string;
  departureTime: Date;
  description: string;
  flightNumber: string;
  arrivalPoint: string;
  intermediatePoints: string[];
  orderTariffAdditionalServices: {
    serviceUuid: string;
    name: string;
    price: number;
  }[];
  status: Status;
  tariffUuid: string;
  tariff: Tariff;
  createdAt: Date;
  updatedAt: Date;
}

export const useOrderCreateLogic = (uuid?: string) => {
  const router = useRouter();

  const formMethods = useForm<CreateOrderData>({
    mode: 'onBlur',
  });
  const { setValue, watch, reset } = formMethods;
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isEditingProp, setIsEditingProp] = useState(!!uuid);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (uuid) {
        try {
          const response = await fetch(`/api/orders/${uuid}`);
          if (!response.ok) {
            const errorData = await response.json();
            showToast.error(
              errorData.error || `Network response was not ok: ${response.statusText}`,
            );
            return;
          }
          const data = await response.json();
          setOrderData(data);
          reset(data);
        } catch (error) {
          showToast.error(`Error fetching order data: ${error}`);
        }
      }
    };

    fetchOrderData();
  }, [uuid, reset]);

  const { ...message } = useErrorMessage();

  const { ...clients } = useOrderCreateClients({
    assignedClientId: orderData?.createdBy,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...handlers } = useOrderConfiguration({
    setValue: formMethods.setValue as unknown as UseFormSetValue<OrderData>,
    selectedVehicleType: orderData?.tariff?.vehicleType,
    selectedServiceLevel: orderData?.tariff.serviceLevel,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...points } = useOrderCreatePoints({
    additionalPointPrice: handlers.selectedTariff?.additionalPointPrice,
    departurePoint: orderData?.departurePoint,
    arrivalPoint: orderData?.arrivalPoint,
    intermediatePoints: orderData?.intermediatePoints,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...additionalServices } = useOrderCreateAdditionalServices({
    watch,
    orderTariffAdditionalServices: orderData?.orderTariffAdditionalServices,
    selectedTariff: handlers.selectedTariff,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...drivers } = useOrderCreateDrivers({
    setValue: formMethods.setValue as unknown as UseFormSetValue<OrderData>,
    assignedDriverId: orderData?.assignedDriverId,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...time } = useOrderTime({
    setValue,
    watch,
    selectedTariff: handlers.selectedTariff,
    selectedDeparturePoint: points?.selectedDeparturePoint,
  });

  const { ...priceCalculation } = useOrderPriceCalculation({
    setValue,
    watch,
    priceTariff: handlers.selectedTariff?.price,
    additionalPointPrice: handlers.selectedTariff?.additionalPointPrice,
    selectedAdditionalServices: additionalServices.selectedAdditionalServices,
    selectedArrivalPoint: points.selectedArrivalPoint,
    selectedIntermediatePoints: points.selectedIntermediatePoints?.filter(
      (point): point is Point => point !== null,
    ),
    extraWaitingTimeCost: time.extraWaitingTimeCost,
  });

  const { ...notification } = useNotifications({
    formData: watch(),
    message: message.message,
    selectedClientInfo: clients.selectedClientInfo,
    selectedDriverInfo: drivers.selectedDriverInfo,
    selectedTariff: handlers.selectedTariff,
    departurePoint: points?.selectedDeparturePoint,
    arrivalPoint: points?.selectedArrivalPoint,
    setErrorMessage: message.setErrorMessage,
    setInitialFormData: () => {},
    isEditing: isEditingProp,
  });

  const onSubmit = async (data: CreateOrderData) => {
    try {
      const cleanedIntermediatePoints = cleanIntermediatePoints(data.intermediatePoints || []);

      const orderData: CreateOrderData = {
        ...data,
        intermediatePoints: cleanedIntermediatePoints,
        selectedServices: additionalServices.selectedAdditionalServices.map(
          (service) => service.uuid,
        ),
      };

      const method = uuid ? 'PUT' : 'POST';
      const url = uuid ? `/api/orders/${uuid}` : '/api/orders';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast.error(errorData.error || `Network response was not ok: ${response.statusText}`);
      }
      showToast.success(uuid ? 'Order updated successfully!' : 'Order created successfully!');
      notification.handleOrderSuccess();
      router.push('/orders');
    } catch (error) {
      notification.handleOrderError(error);
    }
  };

  const modalData = {
    ...formMethods,
    ...handlers,
    ...drivers,
    ...clients,
    ...notification,
    ...points,
    ...additionalServices,
    ...time,
    ...priceCalculation,
    ...message,
  };

  return {
    ...formMethods,
    ...handlers,
    ...drivers,
    ...clients,
    ...notification,
    ...points,
    ...additionalServices,
    ...time,
    ...priceCalculation,
    ...message,
    onSubmit,
    isEditingProp,
    modalData,
  };
};
