import React, { useState, useEffect } from 'react';
import {
  OrderStatus,
  DriverAcceptanceStatus,
  Action,
  Notification,
  TariffOnService,
  AdditionalService,
} from '@prisma/client';
import {
  fetchOrderDetails,
  updateOrderStatus,
} from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface OrderDetail {
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  createdBy: { fullName: string; phone: string };
  tariff: { name: string; price: number };
  departureTime: string;
  description: string | null;
  additionalServices?: (TariffOnService & AdditionalService)[];
  driverAcceptanceStatus?: DriverAcceptanceStatus;
  status: OrderStatus;
}

interface OrderProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  getDriverNotifications: (driverId: string) => Notification[];
}

const OrderProgressModal: React.FC<OrderProgressModalProps> = ({
  isOpen,
  onClose,
  notification,
  getDriverNotifications,
}) => {
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  const socket = useSocket('notification');

  useEffect(() => {
    if (!isOpen || !notification.orderId) return;
    setIsLoading(true);
    fetchOrderDetails(notification.orderId)
      .then((data) => {
        setOrderData(data);
        setOrderStatus(data.status);
        const initialStage = data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING;
        setCurrentStage(initialStage);
        if (
          data.status === OrderStatus.COMPLETED ||
          data.status === OrderStatus.CANCELLED ||
          data.status === OrderStatus.OVERDUE
        ) {
          onClose();
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные заказа');
        setIsLoading(false);
      });
  }, [isOpen, notification.orderId, onClose]);

  const stages: Record<DriverAcceptanceStatus, string> = {
    PENDING: 'Ожидание принятия заказа',
    TAKEN: 'Водитель уведомлен о заказе',
    ACCEPTED: 'Заказ принят водителем',
    ON_THE_WAY: 'Еду к клиенту',
    ARRIVED: 'Прибыл к клиенту',
    PICKED_UP: 'Клиент в машине, поездка начата',
    COMPLETED: 'Поездка завершена',
    TIMEOUT: 'Время ожидания истекло',
  };

  const stageToOrderStatus: Partial<Record<DriverAcceptanceStatus, OrderStatus>> = {
    TAKEN: OrderStatus.PLANNED,
    ACCEPTED: OrderStatus.IN_PROGRESS,
    ON_THE_WAY: OrderStatus.IN_PROGRESS,
    ARRIVED: OrderStatus.IN_PROGRESS,
    PICKED_UP: OrderStatus.IN_PROGRESS,
    COMPLETED: OrderStatus.COMPLETED,
    PENDING: OrderStatus.CANCELLED,
  };

  const handleNextStage = async (nextDriverStage: DriverAcceptanceStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      if (nextDriverStage === DriverAcceptanceStatus.ACCEPTED) {
        const driverNotifications = getDriverNotifications(notification.userId);
        const hasActiveOrder = driverNotifications.some(
          (n) =>
            n.userId === notification.userId &&
            n.action === Action.inProgress &&
            n.orderId !== notification.orderId,
        );
        if (hasActiveOrder) {
          setError('Вы не можете принять новый заказ, пока не завершите текущий');
          setIsLoading(false);
          return;
        }
      }

      const newOrderStatus = stageToOrderStatus[nextDriverStage] || orderStatus;
      const isFinalStage =
        nextDriverStage === DriverAcceptanceStatus.COMPLETED ||
        nextDriverStage === DriverAcceptanceStatus.TIMEOUT;
      const updatedAction = isFinalStage
        ? nextDriverStage === DriverAcceptanceStatus.COMPLETED
          ? Action.success
          : Action.cancelled
        : Action.inProgress;

      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: nextDriverStage,
        orderStatus: newOrderStatus,
        driverId: notification.userId,
        notificationUuid: notification.uuid,
        markNotificationAsRead: true,
        action: updatedAction,
      });

      setCurrentStage(nextDriverStage);
      setOrderStatus(newOrderStatus);

      if (socket) {
        const updatedNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          orderId: notification.orderId,
          action: updatedAction,
          read: true,
        };
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedNotification,
        });

        if (nextDriverStage === DriverAcceptanceStatus.COMPLETED) {
          const completionNotification = {
            uuid: notification.uuid,
            userId: notification.userId,
            title: 'Поездка завершена',
            message: 'Вы успешно завершили поездку.',
            orderId: notification.orderId,
            action: Action.info,
            read: false,
          };
          socket.emit('notification', {
            userId: notification.userId,
            notification: completionNotification,
          });
        }
      }

      if (isFinalStage) {
        onClose();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setIsLoading(false);
    }
  };

  const getNextActions = () => {
    switch (currentStage) {
      case DriverAcceptanceStatus.PENDING:
      case DriverAcceptanceStatus.TAKEN:
        return (
          <>
            <button
              className={`px-5 py-2 rounded-md text-white transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={() => handleNextStage(DriverAcceptanceStatus.ACCEPTED)}
              disabled={isLoading}
            >
              Принять заказ
            </button>
            <button
              className={`px-5 py-2 rounded-md text-white transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              }`}
              onClick={() => handleNextStage(DriverAcceptanceStatus.TIMEOUT)}
              disabled={isLoading}
            >
              Отменить заказ
            </button>
          </>
        );
      case DriverAcceptanceStatus.ACCEPTED:
        return (
          <button
            className={`px-5 py-2 rounded-md text-white transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => handleNextStage(DriverAcceptanceStatus.ON_THE_WAY)}
            disabled={isLoading}
          >
            Еду к клиенту
          </button>
        );
      case DriverAcceptanceStatus.ON_THE_WAY:
        return (
          <button
            className={`px-5 py-2 rounded-md text-white transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => handleNextStage(DriverAcceptanceStatus.ARRIVED)}
            disabled={isLoading}
          >
            Прибыл к клиенту
          </button>
        );
      case DriverAcceptanceStatus.ARRIVED:
        return (
          <button
            className={`px-5 py-2 rounded-md text-white transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => handleNextStage(DriverAcceptanceStatus.PICKED_UP)}
            disabled={isLoading}
          >
            Начать поездку
          </button>
        );
      case DriverAcceptanceStatus.PICKED_UP:
        return (
          <button
            className={`px-5 py-2 rounded-md text-white transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => handleNextStage(DriverAcceptanceStatus.COMPLETED)}
            disabled={isLoading}
          >
            Завершить поездку
          </button>
        );
      default:
        return null;
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
            <h2 className="text-xl font-semibold">Заказ #{notification.orderId}</h2>
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
                  <strong>Клиент:</strong> {orderData.createdBy.fullName} (
                  {orderData.createdBy.phone})
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

              <p className="mt-4 font-semibold">Текущий этап: {stages[currentStage]}</p>
              {error && <p className="text-red-500">{error}</p>}
              {isLoading && (
                <div className="inline-block w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              )}
            </div>
          ) : (
            <p>Не удалось загрузить данные заказа</p>
          )}

          <div className="mt-5 flex gap-2">{getNextActions()}</div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderProgressModal);
