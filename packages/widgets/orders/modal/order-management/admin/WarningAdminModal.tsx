import React, { useState, useEffect, useMemo } from 'react';
import {
  Notification,
  OrderStatus,
  DriverAcceptanceStatus,
  Action,
  UserRole,
} from '@prisma/client';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import { showToast } from '@shared/components/toast/ToastManager';
import { OrderDetail, stages } from '@features/notifications/lib/useNotifications';
import { fetchOrderDetails } from '@widgets/orders/modal/order-management/api/apiOrder';
import WarningStage from '@widgets/orders/modal/order-management/admin/stage/WarningStage';
import CancelledStage from '@widgets/orders/modal/order-management/admin/stage/CancelledStage';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  notifications?: Notification[];
  userRole?: UserRole;
}

const WarningAdminModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  notification,
  notifications = [],
  userRole,
}) => {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  const loadOrderDetails = async () => {
    if (
      !isOpen ||
      !notification.orderId ||
      (userRole !== UserRole.Admin && userRole !== UserRole.Operator)
    )
      return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrderDetails(notification.orderId);
      setOrderData(data);
      if (
        data.status === OrderStatus.COMPLETED ||
        (data.status === OrderStatus.CANCELLED && notification.action !== Action.cancelled) ||
        (data.driverAcceptanceStatus === DriverAcceptanceStatus.ACCEPTED &&
          notification.action === Action.warning)
      ) {
        onClose();
      }
    } catch (err) {
      console.error('Ошибка загрузки данных заказа:', err);
      setError('Не удалось загрузить данные заказа');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, [isOpen, notification.orderId, notification.action, onClose, userRole]);

  useEffect(() => {
    if (
      !isOpen ||
      !notification.orderId ||
      !notifications.length ||
      (userRole !== UserRole.Admin && userRole !== UserRole.Operator)
    )
      return;

    const latestNotification = notifications.find(
      (n) =>
        n.orderId === notification.orderId &&
        (n.userId === notification.userId ||
          n.driverById === notification.driverById ||
          n.createdById === notification.createdById),
    );

    if (latestNotification) {
      if (
        latestNotification.action !== Action.warning &&
        latestNotification.action !== Action.cancelled
      ) {
        console.log(`Закрываем модалку: latestNotification.action=${latestNotification.action}`);
        onClose();
        return;
      }
      loadOrderDetails();
    }
  }, [
    isOpen,
    notification.orderId,
    notification.userId,
    notification.driverById,
    notification.createdById,
    notifications,
    onClose,
    userRole,
  ]);

  const markNotificationAsRead = async () => {
    if (notification.read) {
      console.log(`Уведомление ${notification.uuid} уже прочитано`);
      return;
    }

    try {
      const response = await fetch(`/api/notifications/${notification.uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!response.ok) throw new Error('Ошибка при обновлении уведомления');
    } catch (error) {
      console.error('Не удалось отметить уведомление как прочитанное:', error);
      throw error;
    }
  };

  const handleRedirect = async () => {
    if (userRole !== UserRole.Admin && userRole !== UserRole.Operator) return;
    try {
      await markNotificationAsRead();
      router.push(`/order/edit/${notification.orderId}`);
      onClose();
    } catch (error) {
      showToast.error('Не удалось отметить уведомление как прочитанное', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleClose = async () => {
    if (userRole !== UserRole.Admin && userRole !== UserRole.Operator) return;
    try {
      await markNotificationAsRead();
      onClose();
    } catch (error) {
      showToast.error('Не удалось отметить уведомление как прочитанное', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const getActions = useMemo(() => {
    if (notification.action === Action.warning) {
      return <WarningStage onRedirect={handleRedirect} />;
    } else if (notification.action === Action.cancelled) {
      return <CancelledStage onClose={handleClose} />;
    }
    return null;
  }, [notification.action, handleRedirect, handleClose]);

  if (!isOpen || (userRole !== UserRole.Admin && userRole !== UserRole.Operator)) return null;

  const getTitle = () =>
    notification.action === Action.warning ? 'Просроченный заказ' : 'Отменённый заказ';

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
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        {isLoading ? (
          <div className="flex justify-center min-h-[50px]">
            <div className="w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orderData ? (
          <div className="space-y-4">
            {notification.action === Action.warning ? (
              <p className="mb-4 cursor-pointer hover:underline" onClick={handleRedirect}>
                Заказ #{notification.orderId} поступил с просрочкой. Перейти к заказу.
              </p>
            ) : (
              <p className="mb-4">Заказ #{notification.orderId} был отменён.</p>
            )}
            <div>
              <p>
                <strong>Время отправления:</strong>{' '}
                {new Date(orderData.departureTime).toLocaleString()}
              </p>
              <p>
                <strong>Откуда:</strong> {orderData.departurePoint.address}
              </p>
              <p>
                <strong>Куда:</strong> {orderData.arrivalPoint.address}
              </p>
              <p>
                <strong>Клиент:</strong> {orderData.createdBy.fullName} ({orderData.createdBy.phone}
                )
              </p>
              <p>
                <strong>Тариф:</strong> {orderData.tariff.name} ({orderData.tariff.price} сом)
              </p>
              {orderData.description && (
                <p>
                  <strong>Описание:</strong> {orderData.description}
                </p>
              )}
            </div>
            {orderData.additionalServices && orderData.additionalServices.length > 0 && (
              <div>
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setShowAdditionalServices(!showAdditionalServices)}
                >
                  {showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги'}
                </button>
                {showAdditionalServices && (
                  <ul className="mt-2 list-disc pl-5">
                    {orderData.additionalServices.map((service) => (
                      <li key={service.uuid}>
                        {service.name} - {service.price} сом
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {orderData.status && orderData.driverAcceptanceStatus && (
              <p className="text-sm text-gray-600">
                Статус: {orderData.status} | Этап водителя:{' '}
                {stages[orderData.driverAcceptanceStatus]}
              </p>
            )}
            {getActions}
          </div>
        ) : (
          <p className="text-red-500">Данные заказа недоступны</p>
        )}
      </div>
    </div>
  );
};

export default WarningAdminModal;
