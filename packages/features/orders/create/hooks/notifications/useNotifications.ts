import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { useSession } from '@shared/utils/hooks/useSession';
import { Action } from '@prisma/client';

interface OrderResult {
  uuid: string;
  createdById: string;
  assignedDriverId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PointData {
  address: string;
}

interface UseNotificationsProps {
  departurePoint: PointData | null;
  arrivalPoint: PointData | null;
  isEditing: boolean;
}

interface NotificationData {
  uuid: string;
  userId: string;
  title: string;
  message: string;
  orderId: string;
  action: Action;
  read: boolean;
  createdById: string;
  assignedDriverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useNotifications = ({
  departurePoint,
  arrivalPoint,
  isEditing,
}: UseNotificationsProps) => {
  const socket = useSocket('notification');
  const { userSession } = useSession();

  const sendNotification = useCallback(
    async (notification: {
      userId: string;
      title: string;
      message: string;
      orderId: string;
      action: Action;
      createdById: string;
      assignedDriverId?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }) => {
      console.log('sendNotification:', notification);
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            orderId: notification.orderId,
            action: notification.action,
            createdById: notification.createdById,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save notification to database:', response.statusText);
          return;
        }

        const data = await response.json();

        if (socket && notification.userId && data.uuid) {
          const notificationData: NotificationData = {
            uuid: data.uuid,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            orderId: notification.orderId,
            action: notification.action,
            read: data.read ?? false,
            createdById: notification.createdById,
            assignedDriverId: notification.assignedDriverId || data.assignedDriverId,
            ...(isEditing && notification.updatedAt
              ? { updatedAt: notification.updatedAt.toISOString() }
              : {}),
            ...(!isEditing && notification.createdAt
              ? { createdAt: notification.createdAt.toISOString() }
              : {}),
          };
          console.log('Отправляем WebSocket-уведомление:', notificationData);
          socket.emit('notification', {
            userId: notification.userId,
            notification: notificationData,
          });
        }
      } catch (error) {
        console.error('Error saving notification to database:', error);
      }
    },
    [socket, isEditing],
  );

  const handleOrderSuccess = useCallback(
    (result: OrderResult) => {
      const depAddress = departurePoint ? departurePoint.address : 'не указан';
      const arrAddress = arrivalPoint ? arrivalPoint.address : 'не указан';
      const actionText = isEditing ? 'обновлен' : 'создан';

      //Уведомление для текущего пользователя (если он не водитель)
      if (userSession?.uuid && userSession.uuid !== result.assignedDriverId) {
        sendNotification({
          userId: userSession.uuid,
          title: `Заказ ${actionText}`,
          message: `Заказ от ${depAddress} до ${arrAddress} ${actionText}.`,
          orderId: result.uuid,
          action: Action.info,
          createdById: result.createdById,
          assignedDriverId: result.assignedDriverId,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        });
      }

      //Уведомление для создателя заказа (если он не водитель)
      if (result.createdById !== result.assignedDriverId) {
        sendNotification({
          userId: result.createdById,
          title: `Заказ ${actionText}`,
          message: `Ваш заказ от ${depAddress} до ${arrAddress} ${actionText}.`,
          orderId: result.uuid,
          action: Action.info,
          createdById: result.createdById,
          assignedDriverId: result.assignedDriverId,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        });
      }

      //Уведомление для водителя теперь обрабатывается в POST /api/orders
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
