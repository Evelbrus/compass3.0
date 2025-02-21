import React, { useState, useEffect } from 'react';
import { OrderStatus, DriverAcceptanceStatus, Action, Notification } from '@prisma/client';
import {
  fetchOrderDetails,
  updateOrderStatus,
} from '@widgets/orders/modal/driver/api/apiDriverModel';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';

interface OrderDetail {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  createdBy: { fullName: string; phone: string };
  tariff: { name: string; price: number };
  departureTime: string;
  description: string | null;
  driverAcceptanceStatus?: DriverAcceptanceStatus;
  status: OrderStatus;
  assignedDriverId?: string;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
}

export const stages: Record<DriverAcceptanceStatus, string> = {
  PENDING: 'Ожидание принятия заказа водителем',
  TAKEN: 'Водитель уведомлён о заказе',
  ACCEPTED: 'Заказ принят водителем',
  ON_THE_WAY: 'Водитель едет к вам',
  ARRIVED: 'Водитель прибыл к месту',
  PICKED_UP: 'Поездка началась',
  COMPLETED: 'Поездка завершена',
  TIMEOUT: 'Время ожидания истекло',
};

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  notification,
}) => {
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);

  const loadOrderData = async () => {
    if (!notification?.orderId) return;
    setIsLoading(true);
    try {
      const data = await fetchOrderDetails(notification.orderId);
      setOrderData(data);
      setOrderStatus(data.status);
      const newStage = data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING;
      setCurrentStage(newStage);

      if (data.status === OrderStatus.COMPLETED || data.status === OrderStatus.CANCELLED) {
        onClose();
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные заказа');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && notification?.orderId) {
      loadOrderData();
    }
  }, [isOpen, notification?.orderId, notification]);

  const handleCancelOrder = async () => {
    if (!notification?.orderId) return;
    setIsLoading(true);
    setError(null);

    try {
      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.PENDING,
        orderStatus: OrderStatus.CANCELLED,
        driverId: orderData?.assignedDriverId || undefined,
        notificationUuid: notification.uuid,
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

  if (!isOpen) return null;

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
            <h2 className="text-xl font-semibold">Заказ #{notification.orderId || 'N/A'}</h2>
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
              </div>

              <p className="mt-4 font-semibold">Текущий этап: {stages[currentStage]}</p>
              {error && <p className="text-red-500">{error}</p>}
              {isLoading && (
                <div className="inline-block w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              )}
            </div>
          ) : (
            <p>Не удалось загрузить данные заказа</p>
          )}

          <div className="mt-5 flex justify-center gap-4">
            <button
              className={`px-5 py-2 rounded-md text-white transition-colors ${
                isLoading ||
                orderStatus === OrderStatus.COMPLETED ||
                orderStatus === OrderStatus.CANCELLED
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              onClick={handleCancelOrder}
              disabled={
                isLoading ||
                orderStatus === OrderStatus.COMPLETED ||
                orderStatus === OrderStatus.CANCELLED
              }
            >
              Отменить заказ
            </button>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderTrackingModal);
