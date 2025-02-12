import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { useSession } from '@shared/utils/hooks/useSession';
import { Tariff, Point } from '@prisma/client';
import { ExtendedDriver, ExtendedUser } from '@features/orders/create/hooks';

interface UseNotificationsProps {
  formData: Partial<CreateOrderData>;
  message: string;
  selectedClientInfo: ExtendedUser | null;
  selectedDriverInfo: ExtendedDriver | null;
  selectedTariff: Tariff | null;
  departurePoint: Point | null;
  arrivalPoint: Point | null;
  setErrorMessage: (error: Error | null | undefined, message: string) => void;
  setInitialFormData: () => void;
  isEditing: boolean;
}

export const useNotifications = ({
  formData,
  selectedDriverInfo,
  departurePoint,
  arrivalPoint,
  setErrorMessage,
  setInitialFormData,
  isEditing,
}: UseNotificationsProps) => {
  const socket = useSocket();
  const { userSession } = useSession();

  const formatOrderNumber = (date: Date | null | undefined): string => {
    if (!date) {
      console.warn('Invalid date provided to formatOrderNumber:', date);
      return 'N/A';
    }
    try {
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      return formatter.format(date).replace(/[.,\s:]/g, '');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const sendNotification = useCallback(
    async (userId: string, title: string, message: string) => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, title, message }),
        });

        if (!response.ok) {
          console.error('Failed to save notification to database:', response.statusText);
          return;
        }

        const data = await response.json();

        if (socket && userId && data.uuid) {
          socket.emit('notification', {
            userId,
            notification: { uuid: data.uuid, title, message },
          });
        }
      } catch (error) {
        console.error('Error saving notification to database:', error);
      }
    },
    [socket],
  );

  const sendDriverNotification = useCallback(async () => {
    if (
      socket &&
      formData.assignedDriverId &&
      selectedDriverInfo &&
      departurePoint &&
      arrivalPoint
    ) {
      const action = isEditing ? 'обновлен' : 'назначен';
      const vehicleInfo = selectedDriverInfo.vehicleDriver?.vehicle
        ? ` (${selectedDriverInfo.vehicleDriver.vehicle.vehicleType}, ${selectedDriverInfo.vehicleDriver.vehicle.serviceLevels})`
        : '';
      const orderNumber = formatOrderNumber(new Date());
      sendNotification(
        formData.assignedDriverId,
        `Заказ ${action}`,
        `${selectedDriverInfo.fullName}, вам ${action} заказ N ${orderNumber} от ${departurePoint.address} до ${arrivalPoint.address}${vehicleInfo}`,
      );
    }
  }, [
    socket,
    sendNotification,
    formData.assignedDriverId,
    selectedDriverInfo,
    departurePoint,
    arrivalPoint,
    isEditing,
  ]);

  const sendCreatorNotification = useCallback(async () => {
    if (socket && userSession?.uuid && departurePoint && arrivalPoint) {
      const action = isEditing ? 'обновлен' : 'создан';
      const orderNumber = formatOrderNumber(new Date());
      sendNotification(
        userSession.uuid,
        `Заказ ${action}`,
        `Заказ N ${orderNumber} ${action} от ${departurePoint.address} до ${arrivalPoint.address}`,
      );
    }
  }, [socket, userSession, sendNotification, departurePoint, arrivalPoint, isEditing]);

  const sendCreatedByNotification = useCallback(async () => {
    if (formData.createdBy && departurePoint && arrivalPoint) {
      const orderNumber = formatOrderNumber(new Date());
      const action = isEditing ? 'обновлен' : 'создан';
      const message = isEditing
        ? `Ваш заказ N ${orderNumber} обновлен`
        : `Вам создан заказ N ${orderNumber} от ${departurePoint.address} до ${arrivalPoint.address}`;
      sendNotification(formData.createdBy, `Заказ ${action}`, message);
    }
  }, [socket, sendNotification, formData, departurePoint, arrivalPoint, isEditing]);

  const handleOrderSuccess = useCallback(() => {
    setInitialFormData();
    sendDriverNotification();
    sendCreatorNotification();
    sendCreatedByNotification();
    setErrorMessage(null, `Заказ успешно создан.`);
  }, [
    setErrorMessage,
    setInitialFormData,
    sendDriverNotification,
    sendCreatorNotification,
    sendCreatedByNotification,
  ]);

  const handleOrderError = useCallback(
    (error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setErrorMessage(normalizedError, `Error creating order: ${normalizedError.message}`);
    },
    [setErrorMessage],
  );

  return {
    handleOrderSuccess,
    handleOrderError,
    sendNotification,
    sendDriverNotification,
    sendCreatorNotification,
    sendCreatedByNotification,
  };
};
