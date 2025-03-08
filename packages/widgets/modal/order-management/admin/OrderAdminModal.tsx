'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Action, type Notification as PrismaNotification } from '@prisma/client';
import {
  fetchAssignedDriver,
  fetchClientByUuid,
  fetchOrderDetails,
  fetchPointByUuid,
} from '@features/orders/create/api/orders.api';

// Интерфейсы для данных заказа
interface OrderPoint {
  uuid: string;
  address?: string;
}

interface UserInfo {
  uuid?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface TariffAdditionalService {
  uuid: string;
  price: number;
  isAvailable: boolean;
  service: {
    uuid: string;
    name: string;
  };
}

interface OrderDetail {
  uuid: string;
  createdBy?: string | UserInfo;
  assignedDriverId?: string;
  departurePoint?: string | OrderPoint;
  arrivalPoint?: string | OrderPoint;
  intermediatePoints?: (string | OrderPoint)[];
  tariff?: {
    uuid: string;
    name: string;
    price: number;
    description?: string;
    tariffAdditionalServices?: TariffAdditionalService[];
  };
  description?: string | null;
  status: string;
  departureTime: string;
  flightNumber?: string | null;
  waitingTimeMinutes?: number;
  driverAcceptanceStatus?: string;
  orderTariffAdditionalServices?: any[];
  driver?: UserInfo;
  basePrice?: string | number;
}

interface OrderAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: PrismaNotification;
  orderId?: string;
}

const OrderAdminModal: React.FC<OrderAdminModalProps> = ({
  isOpen,
  onClose,
  notification,
  orderId: propOrderId,
}) => {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [departureAddress, setDepartureAddress] = useState<string>('Загрузка...');
  const [arrivalAddress, setArrivalAddress] = useState<string>('Загрузка...');
  const [intermediateAddresses, setIntermediateAddresses] = useState<string[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<UserInfo | null>(null);
  const [driverInfo, setDriverInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);

  // Определяем orderId либо из props, либо из notification
  const orderId = propOrderId || notification?.orderId;

  // Определяем, является ли это предупреждением или отменой
  const isWarningOrCancelled =
    notification?.action === Action.warning || notification?.action === Action.cancelled;

  // Функция для получения адреса точки
  const getPointAddress = async (point: string | OrderPoint | undefined): Promise<string> => {
    if (!point) return 'Адрес не указан';
    if (typeof point === 'string') {
      try {
        const pointData = await fetchPointByUuid(point);
        return pointData.address || 'Адрес не указан';
      } catch (err) {
        console.error(`Ошибка загрузки адреса для point UUID ${point}:`, err);
        return 'Не удалось загрузить адрес';
      }
    } else if (point && 'address' in point && point.address) {
      return point.address;
    }
    return 'Адрес не указан';
  };

  // Загрузка данных о заказе при открытии модального окна
  useEffect(() => {
    if (!isOpen || !orderId) {
      if (!orderId) setError('ID заказа не указан');
      return;
    }

    const loadOrderData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchOrderDetails(orderId);

        if (!data) {
          throw new Error('Данные заказа не получены');
        }

        setOrderData(data);

        // Загружаем адреса точек маршрута
        setDepartureAddress(await getPointAddress(data.departurePoint));
        setArrivalAddress(await getPointAddress(data.arrivalPoint));

        // Загружаем промежуточные точки
        if (data.intermediatePoints && data.intermediatePoints.length > 0) {
          const addresses = await Promise.all(
            data.intermediatePoints.map((point: string | OrderPoint) => getPointAddress(point)),
          );
          setIntermediateAddresses(addresses);
        } else {
          setIntermediateAddresses([]);
        }

        // Загружаем данные о создателе заказа
        if (typeof data.createdBy === 'string') {
          try {
            const userInfo = await fetchClientByUuid(data.createdBy);
            setCreatorInfo(userInfo);
          } catch (err) {
            console.error('Ошибка загрузки данных о клиенте:', err);
          }
        } else if (data.createdBy && typeof data.createdBy === 'object') {
          setCreatorInfo(data.createdBy as UserInfo);
        }

        // Загружаем данные о водителе
        if (data.assignedDriverId) {
          try {
            const driver = await fetchAssignedDriver(data.assignedDriverId);
            setDriverInfo({
              uuid: driver.uuid,
              fullName: driver.fullName,
              phone: driver.phone,
            });
          } catch (err) {
            console.error('Ошибка загрузки данных о водителе:', err);
          }
        } else if (data.driver) {
          setDriverInfo(data.driver);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных заказа:', err);
        setError('Не удалось загрузить данные заказа. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [isOpen, orderId]);

  // Переход на страницу редактирования заказа
  const handleEditOrder = () => {
    router.push(`/order/edit/${orderId}`);
    onClose();
  };

  if (!isOpen) return null;

  // Стили для модальных окон
  const modalBaseStyle = 'fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4';
  const modalContainerStyle =
    'bg-white rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto';
  const modalHeaderStyle = 'flex justify-between items-center mb-6';
  const closeButtonStyle =
    'border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2';
  const modalTitleStyle = 'text-xl font-semibold text-center flex-grow';
  const primaryButtonStyle =
    'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm mr-3';
  const secondaryButtonStyle =
    'px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition';
  const infoCardStyle = 'bg-gray-50 p-4 rounded-lg shadow-sm mb-4';
  const infoCardTitleStyle = 'text-lg font-medium text-gray-800 border-b pb-2 mb-3';

  // Для предупреждений и отмен используем специальный шаблон с сообщением
  if (isWarningOrCancelled && notification) {
    return (
      <div className={modalBaseStyle}>
        <div className={modalContainerStyle}>
          <div className={modalHeaderStyle}>
            <button onClick={onClose} className={closeButtonStyle} aria-label="Закрыть">
              ✕
            </button>
            <h2 className={modalTitleStyle}>
              {notification.action === Action.warning ? 'Предупреждение' : 'Заказ отменен'}
            </h2>
            <div className="w-6"></div>
          </div>

          <div className="mb-6">
            <p className="text-lg mb-2">{notification.title}</p>
            <p className="text-gray-600 whitespace-pre-line">{notification.message}</p>

            {orderId && (
              <p className="mt-4">
                ID заказа: <span className="font-medium">{orderId}</span>
              </p>
            )}
          </div>

          <div className="flex justify-center">
            {orderId && (
              <button className={primaryButtonStyle} onClick={handleEditOrder}>
                Редактировать
              </button>
            )}
            <button className={secondaryButtonStyle} onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Стандартный интерфейс деталей заказа
  return (
    <div className={modalBaseStyle}>
      <div className={modalContainerStyle}>
        <div className={modalHeaderStyle}>
          <button
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className={closeButtonStyle}
          >
            ✕
          </button>
          <h2 className={modalTitleStyle}>Детали заказа {orderId && `#${orderId.slice(0, 8)}`}</h2>
          <div className="w-6"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-5 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button className={secondaryButtonStyle} onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : orderData ? (
          <div className="space-y-4">
            <div className={infoCardStyle}>
              <h3 className={infoCardTitleStyle}>Основная информация</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Время отправления:</p>
                  <p className="font-medium">
                    {orderData.departureTime
                      ? new Date(orderData.departureTime).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Не указано'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Статус:</p>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        orderData.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : orderData.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : orderData.status === 'PENDING' || orderData.status === 'PLANNED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {orderData.status}
                    </span>
                    {orderData.driverAcceptanceStatus && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {orderData.driverAcceptanceStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Маршрут:</p>
                <div className="mt-1 flex flex-col space-y-2">
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="flex-grow">{departureAddress}</p>
                  </div>

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
                    <p className="flex-grow">{arrivalAddress}</p>
                  </div>
                </div>
              </div>

              {orderData.flightNumber && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Номер рейса:</p>
                  <p className="font-medium">{orderData.flightNumber}</p>
                </div>
              )}

              {orderData.waitingTimeMinutes && orderData.waitingTimeMinutes > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Время ожидания:</p>
                  <p className="font-medium">{orderData.waitingTimeMinutes} мин</p>
                </div>
              )}
            </div>

            {creatorInfo && (
              <div className={infoCardStyle}>
                <h3 className={infoCardTitleStyle}>Информация о клиенте</h3>
                <p>
                  <span className="text-sm text-gray-500">Имя:</span>{' '}
                  <span className="font-medium">{creatorInfo.fullName || 'Не указано'}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-500">Телефон:</span>{' '}
                  <span className="font-medium">{creatorInfo.phone || 'Не указан'}</span>
                </p>
                {creatorInfo.email && (
                  <p>
                    <span className="text-sm text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{creatorInfo.email}</span>
                  </p>
                )}
              </div>
            )}

            {driverInfo && (
              <div className={infoCardStyle}>
                <h3 className={infoCardTitleStyle}>Информация о водителе</h3>
                <p>
                  <span className="text-sm text-gray-500">Имя:</span>{' '}
                  <span className="font-medium">{driverInfo.fullName || 'Не указано'}</span>
                </p>
                <p>
                  <span className="text-sm text-gray-500">Телефон:</span>{' '}
                  <span className="font-medium">{driverInfo.phone || 'Не указан'}</span>
                </p>
              </div>
            )}

            <div className={infoCardStyle}>
              <h3 className={infoCardTitleStyle}>Стоимость и услуги</h3>

              <p>
                <span className="text-sm text-gray-500">Общая сумма:</span>{' '}
                <span className="font-medium text-lg text-green-700">
                  {orderData.basePrice || 'Не указана'} сом
                </span>
              </p>

              {orderData.tariff && (
                <>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Тариф:</span>{' '}
                    <span className="font-medium">{orderData.tariff.name}</span>
                    {orderData.tariff.price && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Базовая стоимость: {orderData.tariff.price} сом)
                      </span>
                    )}
                  </div>

                  {orderData.tariff.description && (
                    <p className="mt-1">
                      <span className="text-sm text-gray-500">Описание тарифа:</span>{' '}
                      <span className="text-sm">{orderData.tariff.description}</span>
                    </p>
                  )}
                </>
              )}

              {orderData.tariff?.tariffAdditionalServices &&
                orderData.tariff.tariffAdditionalServices.length > 0 && (
                  <div className="mt-3">
                    <button
                      className="text-blue-500 hover:underline text-sm"
                      onClick={() => setShowAdditionalServices(!showAdditionalServices)}
                    >
                      {showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги'}
                    </button>

                    {showAdditionalServices && (
                      <div className="mt-2 pl-2 border-l-2 border-blue-200">
                        <p className="text-sm text-gray-500 mb-1">
                          Доступные дополнительные услуги:
                        </p>
                        <ul className="space-y-1">
                          {orderData.tariff.tariffAdditionalServices
                            .filter((tas) => tas.isAvailable)
                            .map((tas) => (
                              <li key={tas.uuid} className="flex justify-between text-sm">
                                <span>{tas.service?.name || 'Услуга'}</span>
                                <span className="font-medium">{tas.price || 0} сом</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              {orderData.orderTariffAdditionalServices &&
                orderData.orderTariffAdditionalServices.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Выбранные дополнительные услуги:</p>
                    <ul className="space-y-1">
                      {orderData.orderTariffAdditionalServices.map((service, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{service.name || 'Услуга'}</span>
                          <span className="font-medium">{service.price || 0} сом</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {orderData.description && (
              <div className={infoCardStyle}>
                <h3 className={infoCardTitleStyle}>Описание</h3>
                <p className="whitespace-pre-line">{orderData.description}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500 text-center py-5">Не удалось загрузить данные заказа</p>
        )}

        <div className="mt-6 flex justify-center">
          <button
            className={primaryButtonStyle}
            onClick={handleEditOrder}
            disabled={isLoading || !orderData}
          >
            Редактировать
          </button>
          <button className={secondaryButtonStyle} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderAdminModal);
