'use client';

import React, { useState, useEffect } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import { TextInput } from '@shared/components/ui/inputs';
import { DriverAcceptanceStatus, Order, Point, Tariff, User } from '@prisma/client';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';

//Интерфейс для дополнительных услуг (пример)
interface AdditionalService {
  uuid: string;
  name: string;
  price: number;
}

//Расширяем OrderDetail для поддержки дополнительных услуг
interface OrderDetail extends Order {
  createdBy: User;
  tariff: Tariff;
  departurePoint: Point;
  arrivalPoint: Point;
  assignedDriver: User | null;
  additionalServices?: AdditionalService[];
}

interface OrderInfoModalProps {
  isOpen: boolean;
  orderUuid: string;
  notificationUuid: string;
  onClose: () => void;
  isNotificationRead?: boolean;
}

const OrderInfoModal: React.FC<OrderInfoModalProps> = ({
  isOpen,
  orderUuid,
  notificationUuid,
  onClose,
  isNotificationRead = false,
}) => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState<boolean>(false);

  //Функция-заглушка для onChange (поля только для чтения)
  const noop = () => {};

  //Получение данных заказа при монтировании модального окна
  useEffect(() => {
    if (!orderUuid) return;
    setLoading(true);
    fetch(`/api/orders/modal/${orderUuid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка получения заказа: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке данных заказа:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
        setLoading(false);
      });
  }, [orderUuid]);

  //Обновление статуса водителя происходит только если уведомление еще не прочитано
  useEffect(() => {
    if (!orderUuid) return;
    if (isNotificationRead) return;

    fetch(`/api/orders/drivers/${orderUuid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderUuid: orderUuid,
        driverProgressStatus: DriverAcceptanceStatus.TAKEN,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка обновления статуса водителя: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Статус водителя обновлён (PATCH):', data);
      })
      .catch((err) => {
        console.error('Ошибка при отправке PATCH-запроса для водителя:', err);
      });
  }, [orderData, isNotificationRead, orderUuid]);

  //Пометка уведомления как прочитанного (отправляется только если уведомление еще не прочитано)
  const markNotificationAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/${notificationUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
      if (!response.ok) {
        throw new Error(`Ошибка обновления уведомления: ${response.statusText}`);
      }
      console.log('Уведомление отмечено как прочитанное');
    } catch (err) {
      console.error('Ошибка при обновлении уведомления:', err);
    }
  };

  //Обработчик закрытия модального окна:
  //Если уведомление не прочитано – сначала помечаем его как прочитанное, затем закрываем модалку.
  const handleClose = async () => {
    if (!isNotificationRead) {
      await markNotificationAsRead();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500}>
        <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6">
          {/*Заголовок и кнопка закрытия (иконка в правом верхнем углу) */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center flex-1">Детали заказа</h2>
            <IButton
              variant="close"
              onClick={handleClose}
              aria-label="Закрыть модальное окно"
              className="ml-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
            >
              <CloseIcon />
            </IButton>
          </div>

          {loading ? (
            <p>Загрузка заказа...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orderData ? (
            <div className="space-y-6">
              {/*Верхний блок: Время отправления */}
              <div className="text-center">
                <TextInput
                  label="Время отправления / Departure Time"
                  value={formatDate(orderData.departureTime)}
                  onChange={noop}
                  readOnly
                  disabled
                  type="date"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
              </div>

              {/*Блок: Откуда и Куда */}
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Откуда"
                  value={orderData.departurePoint?.address || ''}
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
                <TextInput
                  label="Куда"
                  value={orderData.arrivalPoint?.address || ''}
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
              </div>

              {/*Блок: ФИО клиента и Номер телефона */}
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="ФИО клиента"
                  value={orderData.createdBy?.fullName || ''}
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
                <TextInput
                  label="Номер телефона"
                  value={orderData.createdBy?.phone || ''}
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
              </div>

              {/*Блок: Тариф */}
              <div>
                <TextInput
                  label="Тариф"
                  value={
                    orderData.tariff
                      ? `${orderData.tariff.name} (${orderData.tariff.price} сом)`
                      : ''
                  }
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
              </div>

              {/*Блок: Номер рейса и Описание */}
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Номер рейса"
                  value={orderData.flightNumber || '—'}
                  onChange={noop}
                  readOnly
                  disabled
                  type="text"
                  error={false}
                  errorBorder={false}
                  validationMessage=""
                />
                <div>
                  <TextInput
                    label="Описание"
                    value={orderData.description || ''}
                    onChange={noop}
                    readOnly
                    disabled
                    type="textarea"
                    error={false}
                    errorBorder={false}
                    validationMessage=""
                    rows={3}
                  />
                </div>
              </div>

              {/*Селектор дополнительных услуг */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdditionalServices((prev) => !prev)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  {showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги'}
                </button>
                {showAdditionalServices &&
                  orderData.additionalServices &&
                  orderData.additionalServices.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 border border-gray-300 text-left">
                              Наименование
                            </th>
                            <th className="px-4 py-2 border border-gray-300 text-left">Цена</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderData.additionalServices.map((service) => (
                            <tr key={service.uuid}>
                              <td className="px-4 py-2 border border-gray-300">{service.name}</td>
                              <td className="px-4 py-2 border border-gray-300">
                                {service.price} сом
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>

              {/*Кнопка "Ознакомлен" или надпись "Ознамился (Прочитано)" */}
              <div className="flex justify-center mt-6">
                {!isNotificationRead ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Ознакомиться
                  </button>
                ) : (
                  <div
                    onClick={onClose}
                    className="px-6 py-2 bg-green-500 text-white rounded cursor-default"
                  >
                    Ознамился (Прочитано)
                  </div>
                )}
              </div>

              {/*Блок: Примечание с датами создания и обновления */}
              <div className="text-sm text-gray-500">
                Создан: {formatDate(orderData.createdAt.toString())} | Обновлено:{' '}
                {formatDate(orderData.updatedAt.toString())}
              </div>
            </div>
          ) : (
            <p>Нет данных для отображения.</p>
          )}
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default OrderInfoModal;
