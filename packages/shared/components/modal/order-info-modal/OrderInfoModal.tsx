'use client';

import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $driverOrderUuid } from '@shared/lib/effector';
import { DriverAcceptanceStatus } from '@prisma/client';

interface OrderInfoModalProps {
  onClose: () => void;
}

const OrderInfoModal: React.FC<OrderInfoModalProps> = ({ onClose }) => {
  const driverOrderUuid = useUnit($driverOrderUuid);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //При монтировании модалки отправляем PATCH-запрос для обновления заказа
  useEffect(() => {
    if (!driverOrderUuid) return;

    //Отправляем driverProgressStatus, который ожидается сервером.
    //Здесь устанавливаем статус "ON_THE_WAY" (начальный статус для водителя)
    fetch(`/api/orders/drivers/${driverOrderUuid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driverProgressStatus: DriverAcceptanceStatus.TAKEN,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка обновления заказа: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Заказ обновлён (PATCH):', data);
      })
      .catch((err) => {
        console.error('Ошибка при отправке PATCH-запроса:', err);
      });
  }, [driverOrderUuid]);

  //Получение данных заказа
  useEffect(() => {
    if (!driverOrderUuid) return;
    setLoading(true);
    fetch(`/api/orders/${driverOrderUuid}`)
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
  }, [driverOrderUuid]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Информация о заказе</h2>
        {loading ? (
          <p>Загрузка данных заказа...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orderData ? (
          <div>
            <p>
              <strong>ID заказа:</strong> {orderData.uuid}
            </p>
            <p>
              <strong>Статус:</strong> {orderData.status}
            </p>
            <p>
              <strong>Дата подачи:</strong> {new Date(orderData.departureTime).toLocaleString()}
            </p>
            {/*Добавьте другие необходимые поля */}
          </div>
        ) : (
          <p>Данные о заказе не найдены.</p>
        )}
        <IButton onClick={onClose} className="mt-4">
          Закрыть
        </IButton>
      </AnimatedComponent>
    </div>
  );
};

export default OrderInfoModal;
