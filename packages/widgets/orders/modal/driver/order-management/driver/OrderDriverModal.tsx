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
import PendingStage from '@widgets/orders/modal/driver/order-management/driver/stage/PendingStage';
import AcceptedStage from '@widgets/orders/modal/driver/order-management/driver/stage/AcceptedStage';
import OnTheWayStage from '@widgets/orders/modal/driver/order-management/driver/stage/OnTheWayStage';
import ArrivedStage from '@widgets/orders/modal/driver/order-management/driver/stage/ArrivedStage';
import PickedUpStage from '@widgets/orders/modal/driver/order-management/driver/stage/PickedUpStage';
import CompletedStage from '@widgets/orders/modal/driver/order-management/driver/stage/CompletedStage';

interface OrderDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  getDriverNotifications?: (driverId: string) => Notification[];
  userRole?: UserRole;
}

const OrderDriverModal: React.FC<OrderDriverModalProps> = ({
  isOpen,
  onClose,
  notification,
  getDriverNotifications,
  userRole,
}) => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  useEffect(() => {
    if (!isOpen || !notification.orderId) return;
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
  }, [isOpen, notification.orderId]);

  useEffect(() => {
    if (
      !isOpen ||
      !notification.orderId ||
      !notification.userId ||
      !getDriverNotifications ||
      userRole !== UserRole.Driver
    )
      return;

    const driverNotifications = getDriverNotifications(notification.userId);
    const latestNotification = driverNotifications.find((n) => n.orderId === notification.orderId);

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
    notification.userId,
    getDriverNotifications,
    userRole,
    onClose,
  ]);

  const driverStatusToOrderStatus: Record<DriverAcceptanceStatus, OrderStatus> = {
    [DriverAcceptanceStatus.PENDING]: OrderStatus.PENDING,
    [DriverAcceptanceStatus.TAKEN]: OrderStatus.PENDING,
    [DriverAcceptanceStatus.ACCEPTED]: OrderStatus.IN_PROGRESS,
    [DriverAcceptanceStatus.ON_THE_WAY]: OrderStatus.IN_PROGRESS,
    [DriverAcceptanceStatus.ARRIVED]: OrderStatus.IN_PROGRESS,
    [DriverAcceptanceStatus.PICKED_UP]: OrderStatus.IN_PROGRESS,
    [DriverAcceptanceStatus.COMPLETED]: OrderStatus.COMPLETED,
    [DriverAcceptanceStatus.TIMEOUT]: OrderStatus.OVERDUE,
  };

  const handleDriverAction = async (
    driverStatus: DriverAcceptanceStatus,
    action: Action,
    successMessage: string,
    errorMessage: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const newOrderStatus = driverStatusToOrderStatus[driverStatus];

      if (driverStatus === DriverAcceptanceStatus.ACCEPTED && getDriverNotifications) {
        const driverNotifications = getDriverNotifications(notification.userId);
        const hasActiveOrder = driverNotifications.some(
          (n) =>
            n.userId === notification.userId &&
            n.action === Action.inProgress &&
            n.orderId !== notification.orderId,
        );
        if (hasActiveOrder) {
          showToast.error('Вы не можете принять новый заказ, пока не завершите текущий', {
            position: 'top-right',
            autoClose: 5000,
          });
          setIsLoading(false);
          return;
        }
      }

      await updateOrderStatus({
        orderUuid: notification.orderId,
        driverStatus,
        orderStatus: newOrderStatus,
        notificationUuid: notification.uuid,
        userId: notification.userId,
        createdById: notification.createdById,
        driverById: notification.driverById || orderData?.assignedDriverId || undefined,
        markNotificationAsRead: true,
        action,
      });

      setCurrentStage(driverStatus);
      setOrderStatus(newOrderStatus);

      showToast[action === Action.success ? 'success' : 'warn'](successMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      onClose();
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      showToast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
    } finally {
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
        driverById: notification.driverById || orderData?.assignedDriverId || undefined,
        markNotificationAsRead: true,
        action: Action.noted,
      });

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
    if (userRole !== UserRole.Driver) return null;

    switch (notification.action) {
      case Action.inProgress:
        switch (currentStage) {
          case DriverAcceptanceStatus.PENDING:
          case DriverAcceptanceStatus.TAKEN:
            return (
              <PendingStage
                onAccept={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.ACCEPTED,
                    Action.inProgress,
                    `Заказ #${notification.orderId} принят`,
                    'Не удалось принять заказ',
                  )
                }
                onCancel={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.PENDING,
                    Action.cancelled,
                    `Заказ #${notification.orderId} отклонён`,
                    'Не удалось отклонить заказ',
                  )
                }
                isLoading={isLoading}
              />
            );
          case DriverAcceptanceStatus.ACCEPTED:
            return (
              <AcceptedStage
                onStartTrip={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.ON_THE_WAY,
                    Action.inProgress,
                    'Вы поехали к клиенту',
                    'Не удалось обновить статус',
                  )
                }
                onCancel={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.TIMEOUT,
                    Action.cancelled,
                    `Заказ #${notification.orderId} отменён водителем`,
                    'Не удалось отменить заказ',
                  )
                }
                isLoading={isLoading}
              />
            );
          case DriverAcceptanceStatus.ON_THE_WAY:
            return (
              <OnTheWayStage
                onArrive={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.ARRIVED,
                    Action.inProgress,
                    'Вы прибыли к клиенту',
                    'Не удалось обновить статус',
                  )
                }
                onCancel={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.TIMEOUT,
                    Action.cancelled,
                    `Заказ #${notification.orderId} отменён водителем`,
                    'Не удалось отменить заказ',
                  )
                }
                isLoading={isLoading}
              />
            );
          case DriverAcceptanceStatus.ARRIVED:
            return (
              <ArrivedStage
                onPickUp={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.PICKED_UP,
                    Action.inProgress,
                    'Поездка начата',
                    'Не удалось начать поездку',
                  )
                }
                isLoading={isLoading}
              />
            );
          case DriverAcceptanceStatus.PICKED_UP:
            return (
              <PickedUpStage
                onComplete={() =>
                  handleDriverAction(
                    DriverAcceptanceStatus.COMPLETED,
                    Action.success,
                    `Заказ #${notification.orderId} завершён`,
                    'Не удалось завершить поездку',
                  )
                }
                isLoading={isLoading}
              />
            );
          case DriverAcceptanceStatus.COMPLETED:
            return <CompletedStage />;
          default:
            return null;
        }
      case Action.noted:
        return (
          <div className="flex justify-center mt-6">
            {notification.read ? (
              <div
                className="px-6 py-2 bg-green-500 text-white rounded cursor-default"
                onClick={onClose}
              >
                Ознакомился (Прочитано)
              </div>
            ) : (
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={handleMarkAsRead}
              >
                Ознакомился
              </button>
            )}
          </div>
        );
      case Action.warning:
        return (
          <>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={() =>
                handleDriverAction(
                  DriverAcceptanceStatus.ACCEPTED,
                  Action.inProgress,
                  `Заказ #${notification.orderId} принят`,
                  'Не удалось принять заказ',
                )
              }
            >
              Взять заказ
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() =>
                handleDriverAction(
                  DriverAcceptanceStatus.TIMEOUT,
                  Action.cancelled,
                  `Заказ #${notification.orderId} отклонён`,
                  'Не удалось отклонить заказ',
                )
              }
            >
              Отклонить
            </button>
          </>
        );
      case Action.success:
        return (
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-2 bg-green-500 text-white rounded cursor-default"
              onClick={onClose}
            >
              Заказ завершён
            </button>
          </div>
        );
      case Action.cancelled:
        return (
          <div className="flex justify-center mt-6">
            <div className="px-6 py-2 bg-red-500 text-white rounded cursor-default">
              Заказ отменён
            </div>
            <button
              className="ml-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
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
            <h2 className="text-xl font-semibold">
              Заказ #{notification.orderId} -{' '}
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

              {(notification.action === Action.inProgress ||
                notification.action === Action.warning) && (
                <p className="mt-4 font-semibold">Текущий этап: {stages[currentStage]}</p>
              )}
              {error && <p className="text-red-500">{error}</p>}
            </div>
          ) : (
            <p className="text-red-500">Не удалось загрузить данные заказа</p>
          )}

          <div className="mt-5 flex gap-2 justify-center">{getActions()}</div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderDriverModal);
