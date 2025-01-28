import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface UseNotificationsProps {
  formData: Partial<CreateOrderData>;
  message: string;
  setErrorMessage: (error: any, message: string) => void;
  setInitialFormData: () => void;
}

export const useNotifications = ({
  formData,
  message,
  setErrorMessage,
  setInitialFormData,
}: UseNotificationsProps) => {
  const socket = useSocket();

  const sendNotification = useCallback(async () => {
    if (socket && formData.assignedDriverId) {
      socket.emit('notification', {
        userId: formData.assignedDriverId,
        notification: {
          title: 'Новый заказ',
          message: `Вам назначен новый заказ от ${formData.departurePoint} до ${formData.arrivalPoint}`,
        },
      });
    }
  }, [formData, socket]);

  const handleOrderSuccess = useCallback(
    (result: { uuid: string }) => {
      setInitialFormData();
      sendNotification();
      setErrorMessage(null, `Order created successfully: ${result.uuid}`);
    },
    [setErrorMessage, setInitialFormData, sendNotification],
  );

  const handleOrderError = useCallback(
    (error: any) => {
      setErrorMessage(error, `Error creating order: ${(error as Error).message}`);
    },
    [setErrorMessage],
  );

  return { handleOrderSuccess, handleOrderError, sendNotification };
};
