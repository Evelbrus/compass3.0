//src/features/orders/driver-notifications/hooks/usePreOrderModalManager.ts
import { useState, useCallback } from 'react';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

export enum ModalType {
  NONE = 'NONE',
  PRE_ORDER_NOTIFICATION = 'PRE_ORDER_NOTIFICATION',
}

export interface DriverNotification {
  uuid: string;
  orderId: string;
  driverId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  status: DriverAcceptanceStatus;
  type: 'info' | 'action';
}

interface UsePreOrderModalManager {
  modalType: ModalType;
  notification: DriverNotification | null;
  openPreOrderNotificationModal: (notification: DriverNotification) => void;
  closeModal: () => void;

  onTheWay: (notificationId: string) => Promise<void>;
  arrived: (notificationId: string) => Promise<void>;
  pickedUp: (notificationId: string) => Promise<void>;
  completed: (notificationId: string) => Promise<void>;
}

export const usePreOrderModalManager = (): UsePreOrderModalManager => {
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE);
  const [notification, setNotification] = useState<DriverNotification | null>(null);

  const openPreOrderNotificationModal = useCallback((notification: DriverNotification) => {
    console.log('Открываем модальное окно предварительного уведомления:', notification);
    setModalType(ModalType.PRE_ORDER_NOTIFICATION);
    setNotification(notification);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Закрываем модальное окно');
    setModalType(ModalType.NONE);
    setNotification(null);
  }, []);

  const onTheWay = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/driver-notifications/${notificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: DriverAcceptanceStatus.ON_THE_WAY,
            orderStatus: OrderStatus.IN_PROGRESS,
          }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось изменить статус: ${response.statusText}`);
        }
        closeModal();
      } catch (err: any) {
        console.error('Ошибка при изменении статуса:', err);
      }
    },
    [closeModal],
  );

  const arrived = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/driver-notifications/${notificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: DriverAcceptanceStatus.ARRIVED,
            orderStatus: OrderStatus.IN_PROGRESS,
          }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось изменить статус: ${response.statusText}`);
        }
        closeModal();
      } catch (err: any) {
        console.error('Ошибка при изменении статуса:', err);
      }
    },
    [closeModal],
  );

  const pickedUp = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/driver-notifications/${notificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: DriverAcceptanceStatus.PICKED_UP,
            orderStatus: OrderStatus.IN_PROGRESS,
          }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось изменить статус: ${response.statusText}`);
        }
        closeModal();
      } catch (err: any) {
        console.error('Ошибка при изменении статуса:', err);
      }
    },
    [closeModal],
  );

  const completed = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/driver-notifications/${notificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: DriverAcceptanceStatus.COMPLETED,
            orderStatus: OrderStatus.COMPLETED,
          }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось изменить статус: ${response.statusText}`);
        }
        closeModal();
      } catch (err: any) {
        console.error('Ошибка при изменении статуса:', err);
      }
    },
    [closeModal],
  );

  return {
    modalType,
    notification,
    openPreOrderNotificationModal,
    closeModal,
    onTheWay,
    arrived,
    pickedUp,
    completed,
  };
};
