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

export const useClientNotifications = () => {
  const socket = useSocket();
  const { userSession } = useSession();

  const sendNotification = useCallback(
    async (
      userId: string,
      title: string,
      message: string,
      orderId: string,
      action: Action = Action.info,
    ) => {
      if (!userSession?.uuid) {
        console.warn('Нет userSession для отправки уведомления');
        return;
      }
      try {
        const response = await fetch('/api/client-corp/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title,
            message,
            orderId,
            action,
            createdById: userSession.uuid,
          }),
        });

        if (!response.ok) {
          console.error('Ошибка при сохранении уведомления:', response.statusText);
          return;
        }

        const data = await response.json();
        console.log('Отправляем индивидуальное уведомление:', {
          userId,
          title,
          message,
          orderId,
          action,
          data,
        });
        if (socket && userId && data.uuid) {
          socket.emit('notification', {
            userId,
            notification: {
              uuid: data.uuid,
              userId,
              title,
              message,
              orderId,
              action,
              read: false,
              createdById: userSession.uuid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        }
      } catch (error: any) {
        console.error('Ошибка при сохранении уведомления:', error);
      }
    },
    [socket, userSession],
  );

  const handleOrderSuccess = useCallback((result: OrderResult) => {
    //Уведомления отправляются в POST /api/client-corp/orders, здесь только логируем
    console.log('Заказ успешно создан:', result);
  }, []);

  const handleOrderError = useCallback((error: any) => {
    console.error('Ошибка при создании заказа:', error?.message || error);
  }, []);

  return {
    handleOrderSuccess,
    handleOrderError,
    sendNotification,
  };
};

export default useClientNotifications;
