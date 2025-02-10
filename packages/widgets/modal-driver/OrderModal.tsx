//src/components/OrderModal.tsx

import React, { useState, useCallback } from 'react';

import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';
import { DriverNotification } from '@features/orders/driver-notifications/hooks/useModalManager';

interface OrderModalProps {
  notification: DriverNotification;
  closeModal: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ notification, closeModal }) => {
  const [step, setStep] = useState(1);

  const updateStatus = useCallback(
    async (status: DriverAcceptanceStatus, orderStatus?: OrderStatus) => {
      try {
        const response = await fetch(`/api/driver-notifications/${notification.uuid}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status,
            orderStatus: orderStatus,
          }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось изменить статус: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Ошибка при изменении статуса:', error);
        alert(error.message || 'Не удалось изменить статус');
      }
    },
    [notification],
  );

  const handleOnTheWay = useCallback(async () => {
    await updateStatus(DriverAcceptanceStatus.ON_THE_WAY, OrderStatus.IN_PROGRESS);
    setStep(2);
  }, [updateStatus]);

  const handleArrived = useCallback(async () => {
    await updateStatus(DriverAcceptanceStatus.ARRIVED, OrderStatus.IN_PROGRESS);
    setStep(3);
  }, [updateStatus]);

  const handlePickedUp = useCallback(async () => {
    await updateStatus(DriverAcceptanceStatus.PICKED_UP, OrderStatus.IN_PROGRESS);
    setStep(4);
  }, [updateStatus]);

  const handleCompleted = useCallback(async () => {
    await updateStatus(DriverAcceptanceStatus.COMPLETED, OrderStatus.COMPLETED);
    closeModal();
  }, [updateStatus, closeModal]);

  return (
    <div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>

      {step === 1 && <button onClick={handleOnTheWay}>В Пути</button>}
      {step === 2 && <button onClick={handleArrived}>Прибыл</button>}
      {step === 3 && <button onClick={handlePickedUp}>Взял пассажиров</button>}
      {step === 4 && <button onClick={handleCompleted}>Завершил</button>}
    </div>
  );
};
