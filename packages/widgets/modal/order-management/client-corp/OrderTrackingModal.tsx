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
import { updateClientOrderStatus } from '@widgets/modal/order-management/client-corp/api/apiClientCorpModel';
import {
  CancelOrderStage,
  CompletedStage,
  CancelledStage,
} from '@widgets/modal/order-management/client-corp/stage';
import { fetchOrderDetails, fetchPointByUuid } from '@features/orders/create/api/orders.api';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import { showToast } from '@shared/components/toast/ToastManager';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: PrismaNotification;
  userRole?: UserRole;
  userSession: UserSession | null; // Добавляем userSession для хука
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  notification,
  userRole,
  userSession,
}) => {
  const { getClientNotifications } = useNotifications({ userSession }); // Используем хук внутри

  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [intermediateAddresses, setIntermediateAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen || !notification.orderId || userRole !== UserRole.ClientCorp) return;
    setIsLoading(true);
    setError(null);
    fetchOrderDetails(notification.orderId)
      .then(async (data) => {
        setOrderData(data);
        setOrderStatus(data.status);
        setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);

        // Загрузка промежуточных точек, если они есть
        if (data.intermediatePoints && data.intermediatePoints.length > 0) {
          try {
            const addresses = await Promise.all(
              data.intermediatePoints.map(async (pointId: string | { address: string }) => {
                try {
                  if (typeof pointId === 'string') {
                    const pointData = await fetchPointByUuid(pointId);
                    return pointData.address || 'Адрес не указан';
                  } else if (
                    typeof pointId === 'object' &&
                    pointId !== null &&
                    'address' in pointId
                  ) {
                    return pointId.address || 'Адрес не указан';
                  }
                  return 'Некорректный формат адреса';
                } catch (error) {
                  console.error(`Ошибка загрузки точки ${pointId}:`, error);
                  return 'Адрес не загружен';
                }
              }),
            );
            setIntermediateAddresses(addresses);
          } catch (err) {
            console.error('Ошибка загрузки промежуточных точек:', err);
          }
        }
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
      userRole !== UserRole.ClientCorp
    )
      return;

    const clientNotifications = getClientNotifications(notification.createdById);
    const latestNotification = clientNotifications.find((n) => n.orderId === notification.orderId);

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
      await updateClientOrderStatus({
        orderUuid: notification.orderId,
        driverStatus: DriverAcceptanceStatus.PENDING,
        orderStatus: OrderStatus.CANCELLED,
        notificationUuid: notification.uuid,
        userId: notification.createdById,
        createdById: notification.createdById,
        action: Action.cancelled,
        markNotificationAsRead: true,
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
      await updateClientOrderStatus({
        orderUuid: notification.orderId,
        notificationUuid: notification.uuid,
        userId: notification.createdById,
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

  const handleCloseModal = () => {
    onClose();
  };

  const getActions = () => {
    if (userRole !== UserRole.ClientCorp) return null;

    switch (notification.action) {
      case Action.noted:
        return (
          <div className="flex justify-center mt-6">
            {notification.read ? (
              <button
                className="px-6 py-2 bg-green-500 text-white rounded cursor-default"
                onClick={handleCloseModal}
              >
                Уведомление прочитано
              </button>
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
        return <CompletedStage onClose={handleCloseModal} />;
      case Action.cancelled:
        return <CancelledStage onClose={handleCloseModal} orderId={notification.orderId} />;
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
              onClick={handleCloseModal}
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
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Маршрут:</p>
                  <div className="mt-1 flex flex-col space-y-2">
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <p className="flex-grow">{orderData.departurePoint.address}</p>
                    </div>

                    {/* Промежуточные точки */}
                    {intermediateAddresses.length > 0 &&
                      intermediateAddresses.map((address, index) => (
                        <div key={index} className="flex items-start">
                          <div className="mr-2 mt-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          </div>
                          <p className="flex-grow">{address}</p>
                        </div>
                      ))}

                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <p className="flex-grow">{orderData.arrivalPoint.address}</p>
                    </div>
                  </div>
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
                    {orderData.basePrice || orderData.tariff.price} сом
                  </span>
                </p>

                {/* Тариф */}
                <p className="mb-2">
                  <span className="text-sm text-gray-500">Тариф:</span>{' '}
                  <span className="font-medium">{orderData.tariff.name}</span>
                  {orderData.tariff.price && !orderData.basePrice && (
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

          <div className="mt-5 flex justify-center gap-4">{getActions()}</div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderTrackingModal);
