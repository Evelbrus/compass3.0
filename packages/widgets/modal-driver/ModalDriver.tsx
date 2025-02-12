//src/components/ModalDriver.tsx
'use client';

import React, { createContext, useEffect, useState } from 'react';
import { useDriverNotifications } from '@features/orders/driver-notifications/hooks/useDriverNotifications';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { NotificationModal } from './NotificationModal';
import { useModalManager } from '@features/orders/driver-notifications/hooks/useModalManager';
import { PreOrderNotificationModal } from '@widgets/modal-driver/PreOrderNotificationModal';
import { usePreOrderModalManager } from '@features/orders/driver-notifications/hooks/usePreOrderModalManager';

interface ModalDriverProps {
  userSession?: UserSession | null;
}

//Создаем контекст для управления состоянием модалки
interface ModalContextProps {
  isModalOpen: boolean;
  closeFirstModal: () => void;
}

const ModalContext = createContext<ModalContextProps>({
  isModalOpen: false,
  closeFirstModal: () => {},
});

const ModalDriver: React.FC<ModalDriverProps> = ({ userSession }) => {
  const driverId = userSession?.uuid;
  const { notifications, isLoading, error, markAsRead, acceptOrder } =
    useDriverNotifications(driverId);
  const { closeModal: closeFirstModal } = useModalManager();
  const {
    modalType: preOrderModalType,
    notification: preOrderNotification,
    closeModal: closePreOrderModal,
    onTheWay,
    arrived,
    pickedUp,
    completed,
  } = usePreOrderModalManager();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(notifications.length > 0);
  }, [notifications]);

  useEffect(() => {
    if (preOrderModalType === 'PRE_ORDER_NOTIFICATION' && isModalOpen) {
      closeFirstModal();
      setIsModalOpen(false);
    }
  }, [preOrderModalType, closeFirstModal, isModalOpen]);

  //console.log('ModalDriver re-rendered:', { userSession, notifications });

  if (isLoading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <ModalContext.Provider value={{ isModalOpen, closeFirstModal }}>
      <>
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            {notifications.map((notification) => (
              <NotificationModal
                key={notification.uuid}
                notification={notification}
                closeModal={closeFirstModal}
                markAsRead={markAsRead}
                acceptOrder={acceptOrder}
              />
            ))}
          </div>
        )}

        {preOrderModalType === 'PRE_ORDER_NOTIFICATION' && preOrderNotification && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              zIndex: 1001,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <PreOrderNotificationModal
              notification={preOrderNotification}
              closeModal={closePreOrderModal}
              onTheWay={onTheWay}
              arrived={arrived}
              pickedUp={pickedUp}
              completed={completed}
            />
          </div>
        )}
      </>
    </ModalContext.Provider>
  );
};

export default ModalDriver;
