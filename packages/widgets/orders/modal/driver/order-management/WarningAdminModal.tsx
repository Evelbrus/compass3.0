import React, { useState, useEffect } from 'react';
import { Notification, OrderStatus, DriverAcceptanceStatus, Action } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import {
  fetchOrderDetails,
} from '@widgets/orders/modal/driver/api/apiDriverModel';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  notifications?: Notification[];
}

const WarningAdminModal: React.FC<WarningModalProps> = ({
                                                          isOpen,
                                                          onClose,
                                                          notification,
                                                          notifications = [],
                                                        }) => {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [driverAcceptanceStatus, setDriverAcceptanceStatus] = useState<DriverAcceptanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Закрываем модалку, если action !== warning
  useEffect(() => {
    if (isOpen && notification.action !== Action.warning) {
      console.log(`Закрываем модалку: action=${notification.action} не warning`);
      onClose();
    }
  }, [isOpen, notification.action, onClose]);

  // Начальная загрузка данных заказа
  useEffect(() => {
    if (!isOpen || !notification.orderId) return;
    setIsLoading(true);
    setError(null);
    fetchOrderDetails(notification.orderId)
      .then((data) => {
        setOrderStatus(data.status);
        setDriverAcceptanceStatus(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
        if (
          data.status === OrderStatus.COMPLETED ||
          data.status === OrderStatus.CANCELLED ||
          data.driverAcceptanceStatus === DriverAcceptanceStatus.ACCEPTED
        ) {
          onClose();
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных заказа:', err);
        setError('Не удалось загрузить данные заказа');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, notification.orderId, onClose]);

  // Подписка на уведомления
  useEffect(() => {
    if (!isOpen || !notification.orderId || !notifications.length) return;

    const latestNotification = notifications.find(
      (n) => n.orderId === notification.orderId && (
        n.userId === notification.userId ||
        n.driverById === notification.driverById ||
        n.createdById === notification.createdById
      )
    );

    if (latestNotification) {
      // Закрываем модалку, если action изменился на info
      if (latestNotification.action === Action.info) {
        console.log(`Закрываем модалку: latestNotification.action=${latestNotification.action}`);
        onClose();
        return;
      }

      fetchOrderDetails(notification.orderId)
        .then((data) => {
          setOrderStatus(data.status);
          setDriverAcceptanceStatus(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
          if (
            data.status === OrderStatus.COMPLETED ||
            data.status === OrderStatus.CANCELLED ||
            data.driverAcceptanceStatus === DriverAcceptanceStatus.ACCEPTED
          ) {
            onClose();
          }
        })
        .catch((err) => {
          console.error('Ошибка при обновлении данных заказа:', err);
          setError('Не удалось обновить статус заказа');
        });
    }
  }, [isOpen, notification.orderId, notification.userId, notification.driverById, notification.createdById, notifications, onClose]);

  const markNotificationAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/${notification.uuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении уведомления');
      }
    } catch (error) {
      console.error('Не удалось отметить уведомление как прочитанное:', error);
    }
  };

  const handleRedirect = async () => {
    await markNotificationAsRead();
    router.push(`/order/edit/${notification.orderId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
        <IButton
          variant="close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
        >
          <CloseIcon />
        </IButton>
        <h2 className="text-xl font-semibold mb-4">Просроченный заказ</h2>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="mb-4 cursor-pointer hover:underline" onClick={handleRedirect}>
              Заказ #{notification.orderId} поступил с просрочкой. Перейти к заказу.
            </p>
            {orderStatus && driverAcceptanceStatus && (
              <p className="text-sm text-gray-600">
                Статус: {orderStatus} | Этап водителя: {stages[driverAcceptanceStatus]}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WarningAdminModal;

// Определяем стадии для отображения статуса водителя
export const stages: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидание принятия заказа',
  TAKEN: 'Водитель уведомлен о заказе',
  ACCEPTED: 'Заказ принят водителем',
  ON_THE_WAY: 'Еду к клиенту',
  ARRIVED: 'Прибыл к клиенту',
  PICKED_UP: 'Клиент в машине, поездка начата',
  COMPLETED: 'Поездка завершена',
  TIMEOUT: 'Время ожидания истекло',
};