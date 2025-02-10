//src/shared/hooks/useModalManager.ts
import { useState, useCallback } from 'react';
import { DriverAcceptanceStatus } from '@prisma/client';

export enum ModalType {
  NONE = 'NONE',
  NOTIFICATION = 'NOTIFICATION',
  ORDER = 'ORDER',
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

interface UseModalManager {
  modalType: ModalType;
  notification: DriverNotification | null;
  openNotificationModal: (notification: DriverNotification) => void;
  openOrderModal: (notification: DriverNotification) => void;
  closeModal: () => void;
}

export const useModalManager = (): UseModalManager => {
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE);
  const [notification, setNotification] = useState<DriverNotification | null>(null);

  const openNotificationModal = useCallback((notification: DriverNotification) => {
    setModalType(ModalType.NOTIFICATION);
    setNotification(notification);
  }, []);

  const openOrderModal = useCallback((notification: DriverNotification) => {
    setModalType(ModalType.ORDER);
    setNotification(notification);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(ModalType.NONE);
    setNotification(null);
  }, []);

  return {
    modalType,
    notification,
    openNotificationModal,
    openOrderModal,
    closeModal,
  };
};
