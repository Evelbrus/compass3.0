import { useForm } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { useErrorMessage } from '@features/orders/create/functions/useErrorMessage';
import {
  useNotifications,
  useOrderCreateClients,
  useOrderCreateDrivers,
  useOrderConfiguration,
  useOrderCreatePoints,
  useOrderCreateAdditionalServices,
} from '@features/orders/create/hooks';
import { cleanIntermediatePoints } from '@features/orders/create/helpers';
import { showToast } from '@shared/components/toast/ToastManager';

export const useOrderCreateLogic = () => {
  const { ...message } = useErrorMessage();

  const { ...clients } = useOrderCreateClients({
    setErrorMessage: message.setErrorMessage,
  });

  const formMethods = useForm<CreateOrderData>({
    mode: 'onBlur',
  });

  const { setValue, watch } = formMethods;

  const { ...points } = useOrderCreatePoints({ setErrorMessage: message.setErrorMessage });

  const { ...additionalServices } = useOrderCreateAdditionalServices({
    setErrorMessage: message.setErrorMessage,
  });

  const { ...handlers } = useOrderConfiguration({
    setValue,
    watch,
    points: points.points,
    setErrorMessage: message.setErrorMessage,
  });

  const { ...drivers } = useOrderCreateDrivers({
    setErrorMessage: message.setErrorMessage,
    selectedVehicleType: handlers.selectedVehicleType,
    selectedServiceLevel: handlers.selectedServiceLevel,
  });

  const { ...notification } = useNotifications({
    formData: watch(),
    message: message.message,
    setErrorMessage: message.setErrorMessage,
    setInitialFormData: () => {},
  });

  const onSubmit = async (data: CreateOrderData) => {
    try {
      const cleanedIntermediatePoints = cleanIntermediatePoints(data.intermediatePoints || []);

      const orderData: CreateOrderData = {
        ...data,
        intermediatePoints: cleanedIntermediatePoints,
        selectedServices: handlers.selectedAdditionalServices,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast.error(errorData.error || `Network response was not ok: ${response.statusText}`);
        throw new Error(errorData.error || `Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      showToast.success('Order created successfully!');
      notification.handleOrderSuccess(result);
    } catch (error) {
      notification.handleOrderError(error);
    }
  };

  return {
    ...formMethods,
    ...handlers,
    ...drivers,
    ...clients,
    ...notification,
    ...points,
    ...additionalServices,
    ...message,
    onSubmit,
  };
};
