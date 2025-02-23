import React, { useState, useEffect } from 'react';
import {
  OrderStatus,
  DriverAcceptanceStatus,
  Action,
  Notification,
  UserRole,
} from '@prisma/client';
import {
  fetchOrderDetails,
  updateOrderStatus,
} from '@widgets/orders/modal/driver/api/apiDriverModel';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';
import { OrderDetail, stages } from '@features/notifications/lib/useNotifications';
import NotedStage from '@widgets/orders/modal/driver/order-management/client-corp/stage/NotedStage';
import CancelOrderStage from '@widgets/orders/modal/driver/order-management/client-corp/stage/CancelOrderStage';
import CompletedStage from '@widgets/orders/modal/driver/order-management/client-corp/stage/CompletedStage';
import CancelledStage from '@widgets/orders/modal/driver/order-management/client-corp/stage/CancelledStage';


interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  getClientNotifications: (clientId: string) => Notification[];
  userRole?: UserRole;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 notification,
                                                                 getClientNotifications,
                                                                 userRole,
                                                               }) => {
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [notificationRead, setNotificationRead] = useState(notification.read);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  useEffect(() => {
    if (!isOpen || !notification.orderId || userRole !== UserRole.ClientCorp) return;
    setIsLoading(true);
    setError(null);
    fetchOrderDetails(notification.orderId)
      .then((data) => {
        setOrderData(data);
        setOrderStatus(data.status);
        setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные заказа');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, notification.orderId, userRole]);

  useEffect(() => {
    if (
      !isOpen ||
      !notification.orderId ||
      !notification.createdById ||
      !getClientNotifications ||
      userRole !== UserRole.ClientCorp
    )
      return;

    const clientNotifications = getClientNotifications(notification.createdById);
    const latestNotification = clientNotifications.find((n) => n.orderId === notification.orderId);

    if (!latestNotification) {
      console.log('Закрываем модалку: latestNotification undefined');
      onClose();
      return;
    }

    fetchOrderDetails(notification.orderId)
      .then((data) => {
        setOrderData(data);
        setOrderStatus(data.status);
        setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
      })
      .catch((err) => {
        console.error('Ошибка при обновлении данных заказа:', err);
        setError('Не удалось обновить статус заказа');
      });
  }, [
    isOpen,
    notification.orderId,
    notification.createdById,
    getClientNotifications,
    userRole,
    onClose,
  ]);

  const handleCancelOrder = async () => {
    if (!notification.orderId || userRole !== UserRole.ClientCorp) return;
    setIsLoading(true);
    setError(null);

    try {
      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.PENDING,
        orderStatus: OrderStatus.CANCELLED,
        notificationUuid: notification.uuid,
        userId: notification.userId,
        createdById: notification.createdById,
        driverById: orderData?.assignedDriverId || undefined,
        markNotificationAsRead: true,
        action: Action.cancelled,
      });

      setOrderStatus(OrderStatus.CANCELLED);
      setCurrentStage(DriverAcceptanceStatus.PENDING);
      showToast.warn(`Заказ #${notification.orderId} отменён`, {
        position: 'top-right',
        autoClose: 3000,
      });
      onClose();
    } catch (err) {
      console.error('Ошибка при отмене заказа:', err);
      setError(err instanceof Error ? err.message : 'Не удалось отменить заказ');
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await updateOrderStatus({
        orderUuid: notification.orderId,
        notificationUuid: notification.uuid,
        userId: notification.userId,
        createdById: notification.createdById,
        driverById: orderData?.assignedDriverId || undefined,
        markNotificationAsRead: true,
        action: Action.noted,
      });

      setNotificationRead(true);
      showToast.success('Уведомление отмечено как прочитанное', {
        position: 'top-right',
        autoClose: 3000,
      });
      onClose();
    } catch (err) {
      console.error('Ошибка при обновлении уведомления:', err);
      showToast.error('Не удалось отметить уведомление как прочитанное', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const getActions = () => {
    if (userRole !== UserRole.ClientCorp) return null;

    switch (notification.action) {
      case Action.noted:
        return <NotedStage onMarkAsRead={handleMarkAsRead} notificationRead={notificationRead} />;
      case Action.inProgress:
      case Action.warning:
        return (
          <CancelOrderStage
            onCancel={handleCancelOrder}
            isLoading={isLoading}
            currentStage={currentStage}
            orderStatus={orderStatus}
          />
        );
      case Action.success:
        return <CompletedStage onClose={onClose} />;
      case Action.cancelled:
        return <CancelledStage onClose={onClose} orderId={notification.orderId} />;
      default:
        return null;
    }
  };

  if (!isOpen || userRole !== UserRole.ClientCorp) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500}>
        <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <IButton
              variant="close"
              onClick={onClose}
              aria-label="Закрыть модальное окно"
              className="ml-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
            >
              <CloseIcon />
            </IButton>
            <h2 className="text-xl font-semibold">
              Заказ #{notification.orderId || 'N/A'} -{' '}
              {notification.action === Action.warning
                ? 'Просрочен'
                : notification.action === Action.success
                  ? 'Завершён'
                  : notification.action === Action.cancelled
                    ? 'Отменён'
                    : notification.action === Action.noted
                      ? 'Уведомление'
                      : 'В процессе'}
            </h2>
          </div>

          {isLoading && !orderData ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : orderData ? (
            <div className="space-y-4">
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

              {(notification.action === Action.inProgress ||
                notification.action === Action.warning) && (
                <p className="mt-4 font-semibold">Текущий этап: {stages[currentStage]}</p>
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>
          ) : (
            <p className="text-red-500">Не удалось загрузить данные заказа</p>
          )}

          <div className="mt-5 flex justify-center gap-4">{getActions()}</div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderTrackingModal);