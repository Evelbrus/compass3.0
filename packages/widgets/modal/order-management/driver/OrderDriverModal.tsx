'use client';

import React, { useState, useEffect } from 'react';
import {
  OrderStatus,
  DriverAcceptanceStatus,
  Action,
  type Notification as PrismaNotification,
  UserRole,
} from '@prisma/client';
import { UserSession } from '@shared/prisma/interface/users/interface';
import {
  useNotifications,
  OrderDetail,
  stages,
} from '@features/notifications/lib/useNotifications';
import {
  AcceptedStage,
  PendingStage,
  OnTheWayStage,
  ArrivedStage,
  PickedUpStage,
  CompletedStage,
} from '@widgets/modal/order-management/driver/stage';
import { fetchOrderDetails } from '@features/orders/create/api/orders.api';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import { showToast } from '@shared/components/toast/ToastManager';
import { updateDriverOrderStatus } from '@widgets/modal/order-management/driver/api/apiDriverModel';

interface OrderDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: PrismaNotification;
  userRole?: UserRole;
  userSession: UserSession | null; // Добавляем userSession для хука
}

const OrderDriverModal: React.FC<OrderDriverModalProps> = ({
  isOpen,
  onClose,
  notification,
  userRole,
  userSession,
}) => {
  const { getDriverNotifications } = useNotifications({ userSession }); // Вызываем хук внутри

  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [_orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
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
    if (!isOpen || !notification.orderId || !notification.userId || userRole !== UserRole.Driver)
      return;

    const driverNotifications = getDriverNotifications(notification.userId);
    const latestNotification = driverNotifications.find((n) => n.orderId === notification.orderId);

    if (!latestNotification) {
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
      // Если action === cancelled, устанавливаем orderStatus в CANCELLED
      const newOrderStatus =
        action === Action.cancelled
          ? OrderStatus.CANCELLED
          : driverStatusToOrderStatus[driverStatus];

      if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
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

      await updateDriverOrderStatus({
        orderUuid: notification.orderId,
        driverStatus,
        orderStatus: newOrderStatus,
        notificationUuid: notification.uuid,
        userId: notification.userId, // ID водителя
        createdById: notification.createdById,
        action,
        markNotificationAsRead: true,
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
      await updateDriverOrderStatus({
        orderUuid: notification.orderId,
        notificationUuid: notification.uuid,
        userId: notification.userId, // ID водителя
        createdById: notification.createdById,
        action: Action.noted,
        markNotificationAsRead: true,
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
                    DriverAcceptanceStatus.PENDING,
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
                    DriverAcceptanceStatus.PENDING,
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
                  DriverAcceptanceStatus.PENDING,
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
              Заказ #{notification.orderId?.slice(0, 8) || 'N/A'} -{' '}
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
              {/* Основная информация */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
                  Основная информация
                </h3>

                <p className="mb-2">
                  <span className="text-sm text-gray-500">Время отправления:</span>{' '}
                  <span className="font-medium">
                    {new Date(orderData.departureTime).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>

                {/* Маршрут */}
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Маршрут:</p>
                  <div className="mt-1 flex flex-col space-y-2">
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <p className="flex-grow">{orderData.departurePoint.address}</p>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <p className="flex-grow">{orderData.arrivalPoint.address}</p>
                    </div>
                  </div>
                </div>

                {/* Информация о клиенте */}
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Клиент:</p>
                  <p className="font-medium">
                    {orderData.createdBy.fullName} ({orderData.createdBy.phone})
                  </p>
                </div>

                {orderData.description && (
                  <p className="mt-3">
                    <span className="text-sm text-gray-500">Описание:</span>{' '}
                    <span>{orderData.description}</span>
                  </p>
                )}

                {/* Текущий этап */}
                {(notification.action === Action.inProgress ||
                  notification.action === Action.warning) && (
                  <p className="mt-3 font-semibold text-blue-700">
                    Текущий этап: {stages[currentStage]}
                  </p>
                )}
              </div>

              {/* Стоимость и услуги */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
                  Стоимость и услуги
                </h3>

                {/* Общая сумма заказа */}
                <p className="mb-2">
                  <span className="text-sm text-gray-500">Общая сумма:</span>{' '}
                  <span className="font-medium text-lg text-green-700">
                    {'basePrice' in orderData ? orderData.basePrice : orderData.tariff.price} сом
                  </span>
                </p>

                {/* Тариф */}
                <p className="mb-2">
                  <span className="text-sm text-gray-500">Тариф:</span>{' '}
                  <span className="font-medium">{orderData.tariff.name}</span>
                  {orderData.tariff.price && !('basePrice' in orderData) && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({orderData.tariff.price} сом)
                    </span>
                  )}
                </p>

                {/* Дополнительные услуги */}
                {orderData.additionalServices && orderData.additionalServices.length > 0 && (
                  <div className="mt-3">
                    <button
                      className="text-blue-500 hover:underline text-sm"
                      onClick={() => setShowAdditionalServices(!showAdditionalServices)}
                    >
                      {showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги'}
                    </button>
                    {showAdditionalServices && (
                      <div className="mt-2 pl-2 border-l-2 border-blue-200">
                        <p className="text-sm text-gray-500 mb-1">Дополнительные услуги:</p>
                        <ul className="space-y-1">
                          {orderData.additionalServices.map((service) => (
                            <li key={service.uuid} className="flex justify-between text-sm">
                              <span>{service.name}</span>
                              <span className="font-medium">{service.price} сом</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 mt-3">{error}</p>}
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
