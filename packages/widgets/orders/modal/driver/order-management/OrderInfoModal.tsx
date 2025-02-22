import React, { useState, useEffect } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import {
  Order,
  Point,
  Tariff,
  User,
  Notification,
  TariffOnService,
  AdditionalService,
  Action, // Добавляем импорт Action
} from '@prisma/client';
import {
  fetchOrderDetails,
  updateOrderStatus,
} from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';

interface OrderDetail extends Order {
  createdBy: User;
  tariff: Tariff;
  departurePoint: Point;
  arrivalPoint: Point;
  assignedDriver: User | null;
  additionalServices?: (TariffOnService & AdditionalService)[];
}

interface OrderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
}

const OrderInfoModal: React.FC<OrderInfoModalProps> = ({ isOpen, notification, onClose }) => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState<boolean>(false);
  const [notificationRead, setNotificationRead] = useState<boolean>(notification.read);

  const socket = useSocket('notification');

  useEffect(() => {
    if (!isOpen || !notification.orderId) return;
    setLoading(true);
    fetchOrderDetails(notification.orderId)
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке данных заказа:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
        setLoading(false);
      });
  }, [isOpen, notification.orderId]);

  const handleClose = async () => {
    if (!notificationRead) {
      try {
        await updateOrderStatus({
          orderUuid: notification.orderId,
          notificationUuid: notification.uuid,
          userId: notification.userId, // Исправляем driverId на userId
          createdById: notification.createdById || orderData?.createdById || '',
          markNotificationAsRead: true,
          action: Action.info,
          driverById: notification.driverById || orderData?.assignedDriverId || undefined,
        });

        if (socket) {
          const updatedNotification = {
            ...notification,
            read: true,
          };
          console.log('Отправляем WebSocket-уведомление:', updatedNotification);
          socket.emit('notification', {
            userId: notification.userId,
            notification: updatedNotification,
          });
        }

        setNotificationRead(true);
      } catch (err) {
        console.error('Ошибка при обновлении уведомления:', err);
        alert('Не удалось обновить уведомление');
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500}>
        <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center flex-1">Заказ #{notification.orderId}</h2>
            <IButton
              variant="close"
              onClick={onClose}
              aria-label="Закрыть модальное окно"
              className="ml-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
            >
              <CloseIcon />
            </IButton>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orderData ? (
            <div className="space-y-4">
              <div>
                <p>
                  <strong>Время отправления:</strong>{' '}
                  {new Date(orderData.departureTime).toLocaleString()}
                </p>
                <p>
                  <strong>Откуда:</strong> {orderData.departurePoint?.address || '—'}
                </p>
                <p>
                  <strong>Куда:</strong> {orderData.arrivalPoint?.address || '—'}
                </p>
                <p>
                  <strong>Клиент:</strong> {orderData.createdBy?.fullName || '—'} (
                  {orderData.createdBy?.phone || '—'})
                </p>
                <p>
                  <strong>Тариф:</strong>{' '}
                  {orderData.tariff
                    ? `${orderData.tariff.name} (${orderData.tariff.price} сом)`
                    : '—'}
                </p>
                <p>
                  <strong>Номер рейса:</strong> {orderData.flightNumber || '—'}
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

              <div className="flex justify-center mt-6">
                {notificationRead ? (
                  <div className="px-6 py-2 bg-green-500 text-white rounded cursor-default">
                    Ознамился (Прочитано)
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Закрыть
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-500">
                Создан: {new Date(orderData.createdAt).toLocaleString()} | Обновлено:{' '}
                {new Date(orderData.updatedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <p>Не удалось загрузить данные заказа</p>
          )}
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderInfoModal);