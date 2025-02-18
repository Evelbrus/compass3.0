'use client';

import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $driverOrderUuid } from '@shared/lib/effector';

export enum DriverProgressStatus {
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

//Последовательность этапов и подписи на русском языке
const statusSteps: { status: DriverProgressStatus; label: string }[] = [
  { status: DriverProgressStatus.ON_THE_WAY, label: 'В пути' },
  { status: DriverProgressStatus.ARRIVED, label: 'Прибыл' },
  { status: DriverProgressStatus.PICKED_UP, label: 'Пассажир поднят' },
  { status: DriverProgressStatus.COMPLETED, label: 'Завершен' },
];

interface OrderProgressModalProps {
  onClose: () => void;
}

const OrderProgressModal: React.FC<OrderProgressModalProps> = ({ onClose }) => {
  const driverOrderUuid = useUnit($driverOrderUuid);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [patchLoading, setPatchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState<string | null>(null);

  //Функция загрузки данных заказа
  const fetchOrderData = async () => {
    if (!driverOrderUuid) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${driverOrderUuid}`);
      if (!response.ok) {
        throw new Error(`Ошибка получения заказа: ${response.statusText}`);
      }
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      console.error('Ошибка при загрузке данных заказа:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [driverOrderUuid]);

  //Функция обновления статуса заказа
  const updateOrderStatus = async (newStatus: DriverProgressStatus) => {
    if (!driverOrderUuid) return;
    setPatchLoading(true);
    setStatusUpdateMsg(null);
    try {
      const response = await fetch(`/api/orders/drivers/${driverOrderUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverProgressStatus: newStatus }),
      });
      if (!response.ok) {
        throw new Error(`Ошибка обновления статуса: ${response.statusText}`);
      }
      const data = await response.json();
      setStatusUpdateMsg(`Статус обновлен на "${newStatus}"`);
      await fetchOrderData();
    } catch (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении статуса заказа');
    } finally {
      setPatchLoading(false);
    }
  };

  //Функция определения следующего шага
  const getNextStep = (): { status: DriverProgressStatus; label: string } | null => {
    if (!orderData) return null;
    const currentStatus: DriverProgressStatus = orderData.driverProgressStatus;
    const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);
    if (currentIndex === -1) {
      //Если текущего статуса нет в списке, начинаем с первого этапа
      return statusSteps[0] ?? null;
    }
    if (currentIndex >= statusSteps.length - 1) {
      //Если текущий этап последний, следующих шагов нет
      return null;
    }
    //Возвращаем следующий этап; если вдруг значение undefined — возвращаем null
    return statusSteps[currentIndex + 1] ?? null;
  };

  const nextStep = getNextStep();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Прогресс заказа</h2>
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
              <strong>Текущий статус заказа:</strong>{' '}
              {orderData.driverProgressStatus || 'Не указан'}
            </p>
            <p>
              <strong>Дата подачи:</strong> {new Date(orderData.departureTime).toLocaleString()}
            </p>
            <div className="mt-4">
              {nextStep ? (
                <>
                  <p className="mb-2 font-semibold">
                    Обновите статус заказа на: "{nextStep.label}"
                  </p>
                  <IButton
                    onClick={() => updateOrderStatus(nextStep.status)}
                    disabled={patchLoading}
                  >
                    {nextStep.label}
                  </IButton>
                </>
              ) : (
                <p>Все этапы обновления завершены.</p>
              )}
              {/*Кнопка отмены заказа всегда доступна */}
              <div className="mt-4">
                <IButton
                  onClick={() => updateOrderStatus(DriverProgressStatus.CANCELED)}
                  disabled={patchLoading}
                >
                  Отменить заказ
                </IButton>
              </div>
              {patchLoading && <p className="mt-2">Обновление статуса...</p>}
              {statusUpdateMsg && <p className="mt-2 text-green-600">{statusUpdateMsg}</p>}
            </div>
          </div>
        ) : (
          <p>Данных о заказе не найдено.</p>
        )}
        <IButton onClick={onClose} className="mt-4">
          Закрыть
        </IButton>
      </AnimatedComponent>
    </div>
  );
};

export default OrderProgressModal;
