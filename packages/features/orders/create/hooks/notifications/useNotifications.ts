import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { useSession } from '@shared/utils/hooks/useSession';
import { Action } from '@prisma/client';

interface OrderResult {
  uuid: string;
  createdById?: string;
  assignedDriverId?: string;
}

interface PointData {
  address: string;
}

interface UseNotificationsProps {
  departurePoint: PointData | null;
  arrivalPoint: PointData | null;
  isEditing: boolean;
}

export const useNotifications = ({
  departurePoint,
  arrivalPoint,
  isEditing,
}: UseNotificationsProps) => {
  const socket = useSocket('notification');
  const { userSession } = useSession();

  const sendNotification = useCallback(
    async (
      userId: string,
      title: string,
      msg: string,
      orderId: string,
      action: Action = Action.info,
    ) => {
      console.log('sendNotification:', { userId, title, msg, orderId, action });
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, title, message: msg, orderId, action }),
        });

        if (!response.ok) {
          console.error('Failed to save notification to database:', response.statusText);
          return;
        }

        const data = await response.json();

        if (socket && userId && data.uuid) {
          const notificationData = {
            uuid: data.uuid,
            userId: userId,
            title,
            message: msg,
            orderId,
            action,
            read: data.read ?? false,
          };
          console.log('Отправляем WebSocket-уведомление:', notificationData);
          socket.emit('notification', {
            userId,
            notification: notificationData,
          });
        }
      } catch (error) {
        console.error('Error saving notification to database:', error);
      }
    },
    [socket],
  );

  const handleOrderSuccess = useCallback(
    (result: OrderResult) => {
      const depAddress = departurePoint ? departurePoint.address : 'не указан';
      const arrAddress = arrivalPoint ? arrivalPoint.address : 'не указан';
      const actionText = isEditing ? 'обновлен' : 'создан';

      //Уведомление для водителя (assignedDriverId как userId)
      if (result.assignedDriverId) {
        const msgDriver = `Вам ${actionText} заказ от ${depAddress} до ${arrAddress}.`;
        sendNotification(
          result.assignedDriverId,
          `Заказ ${actionText}`,
          msgDriver,
          result.uuid,
          Action.noted,
        );
      } else {
        console.warn('handleOrderSuccess: отсутствует assignedDriverId');
      }

      //Уведомление для текущего пользователя (создателя) через userSession
      if (userSession?.uuid) {
        const msgCreator = `Заказ от ${depAddress} до ${arrAddress} ${actionText}.`;
        sendNotification(
          userSession.uuid,
          `Заказ ${actionText}`,
          msgCreator,
          result.uuid,
          Action.info,
        );
      } else {
        console.warn('handleOrderSuccess: отсутствует userSession');
      }

      //Уведомление для создателя заказа (createdById как userId)
      if (result.createdById) {
        const msgCreatedBy = `Ваш заказ от ${depAddress} до ${arrAddress} ${actionText}.`;
        sendNotification(
          result.createdById,
          `Заказ ${actionText}`,
          msgCreatedBy,
          result.uuid,
          Action.info,
        );
      } else {
        console.warn('handleOrderSuccess: отсутствует createdById');
      }
    },
    [departurePoint, arrivalPoint, isEditing, sendNotification, userSession],
  );

  const handleOrderError = useCallback((error: unknown) => {
    console.error('handleOrderError:', error);
  }, []);

  return {
    handleOrderSuccess,
    handleOrderError,
    sendNotification,
  };
};

export default useNotifications;
