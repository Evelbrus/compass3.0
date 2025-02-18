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
import { useState, useEffect, useCallback } from 'react';
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
  const isEditingProp = !!uuid;

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
    selectedServiceLevel: orderData?.tariff?.serviceLevel,
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

  //Используем новый вариант useNotifications, который не зависит от состояния результата,
  //а его функция handleOrderSuccess принимает результат напрямую.
  const notifications = useNotifications({
    departurePoint: points.selectedDeparturePoint,
    arrivalPoint: points.selectedArrivalPoint,
    isEditing: isEditingProp,
  });

  //Функция, которая будет вызываться после получения ответа от API
  const handleSuccessCallback = useCallback(
    (res: any) => {
      notifications.handleOrderSuccess(res);
      router.push('/orders');
    },
    [notifications, router],
  );

  const onSubmit = async (data: CreateOrderData) => {
    try {
      const cleanedIntermediatePoints = cleanIntermediatePoints(data.intermediatePoints || []);
      const orderDataToSend: CreateOrderData = {
        ...data,
        intermediatePoints: cleanedIntermediatePoints,
        selectedServices: additionalServices.selectedAdditionalServices.map(
          (service) => service.uuid,
        ),
      };

      const method = uuid ? 'PUT' : 'POST';
      const url = uuid ? `/api/orders/${uuid}` : '/api/orders';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast.error(errorData.error || `Network response was not ok: ${response.statusText}`);
        return;
      } else {
        showToast.success(uuid ? 'Order updated successfully!' : 'Order created successfully!');
      }

      if (!uuid) {
        //Если создаётся новый заказ, получаем результат и сразу вызываем уведомление
        const res = await response.json();
        console.log('result', res);
        if (res && res.uuid) {
          handleSuccessCallback(res);
        } else {
          throw new Error('Не удалось получить uuid заказа из ответа сервера');
        }
      } else {
        if (!orderData) {
          //Можно вывести сообщение об ошибке или вернуть, чтобы не продолжать выполнение.
          showToast.error('Нет данных заказа');
          return;
        }

        notifications.handleOrderSuccess({
          uuid,
          assignedDriverId: orderData.assignedDriverId || '',
          createdById: orderData.createdBy || '',
        });
        router.push('/orders');
      }
    } catch (err) {
      notifications.handleOrderError(err);
    }
  };

  const modalData = {
    ...formMethods,
    ...handlers,
    ...drivers,
    ...clients,
    ...notifications,
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
    ...notifications,
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

export default useOrderCreateLogic;
