'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { UserRole, OrderStatus, DriverAcceptanceStatus } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';
import { isOrderCancelled } from '@widgets/modal/order-management/utils/orderUtils';
import { useOrderData } from '@widgets/modal/order-management/hooks/useOrderData';
import { renderOrderActions } from '@widgets/modal/order-management/components/renderOrderActions';
import { markNotificationAsRead } from '@widgets/modal/order-management/api/apiOrderModel';
import OrderHeader from '@widgets/modal/order-management/components/OrderHeader';
import CancelledOrderView from '@widgets/modal/order-management/components/CancelledOrderView';
import OrderStageHeader from '@widgets/modal/order-management/components/OrderStageHeader';
import OrderMapPreview from '@widgets/modal/order-management/components/OrderMapPreview';
import OrderRouteDetails from '@widgets/modal/order-management/components/OrderRouteDetails';
import DriverInfo from '@widgets/modal/order-management/components/DriverInfo';
import OrderPaymentDetails from '@widgets/modal/order-management/components/OrderPaymentDetails';
import OrderNotes from '@widgets/modal/order-management/components/OrderNotes';
import OrderLoadError from '@widgets/modal/order-management/components/OrderLoadError';
import ClientInfo from '@widgets/modal/order-management/components/ClientInfo';
import { $activeNotification } from '@shared/lib/effector/state/state';

// Безопасная функция для строк
const safeStr = (str: string | null): string => str || '';

interface OrderAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderAdminModal: React.FC<OrderAdminModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Получаем уведомление напрямую из хранилища Effector
  const notification = useUnit($activeNotification);

  // Если нет уведомления или модальное окно закрыто, не рендерим компонент
  if (!notification || !isOpen) return null;

  // Используем хук для загрузки данных заказа
  const {
    orderData,
    currentStage,
    orderStatus,
    isLoading,
    error,
    intermediateAddresses,
    progress,
    setCurrentStage,
    setOrderStatus,
    setError,
  } = useOrderData(safeStr(notification.orderId), isOpen);

  // Добавляем useEffect для синхронизации с данными заказа
  useEffect(() => {
    if (
      orderData &&
      orderData.status === OrderStatus.CANCELLED &&
      orderStatus !== OrderStatus.CANCELLED
    ) {
      console.log('Получено уведомление об отмене заказа, изменяем статус в AdminModal');
      setOrderStatus(OrderStatus.CANCELLED);
      setCurrentStage(DriverAcceptanceStatus.PENDING);
    } else if (
      orderData &&
      orderData.status === OrderStatus.COMPLETED &&
      orderStatus !== OrderStatus.COMPLETED
    ) {
      console.log('Получено уведомление о завершении заказа, изменяем статус в AdminModal');
      setOrderStatus(OrderStatus.COMPLETED);
      setCurrentStage(DriverAcceptanceStatus.COMPLETED);
    }
  }, [orderData, orderStatus, setOrderStatus, setCurrentStage]);

  // Обработчик отметки уведомления как прочитанного
  const handleMarkAsRead = async () => {
    // Проверка, если уведомление уже прочитано, просто закрываем модальное окно
    if (notification.read) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      // Используем простую функцию для отметки уведомления как прочитанного
      const success = await markNotificationAsRead(notification.uuid);

      if (success) {
        showToast.success('Уведомление отмечено как прочитанное', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        showToast.error('Не удалось отметить уведомление как прочитанное', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      onClose();
    } catch (err) {
      console.error('Ошибка при обновлении уведомления:', err);
      showToast.error('Не удалось отметить уведомление как прочитанное', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик редактирования заказа
  const handleEditOrder = () => {
    if (notification.orderId) {
      router.push(`/order/edit/${notification.orderId}`);
      onClose();
    } else {
      setError('Невозможно редактировать заказ: orderId отсутствует');
      showToast.error('Невозможно редактировать заказ: orderId отсутствует', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Обработчик закрытия модального окна с отметкой "прочитано"
  const handleCloseWithMarkAsRead = () => {
    // Проверяем статус прочтения перед вызовом API
    if (notification.read) {
      onClose();
    } else {
      handleMarkAsRead();
    }
  };

  // Основной интерфейс для заказов
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className={'w-[700px]'}>
        <div
          className="relative bg-white rounded-2xl w-full p-0 flex flex-col overflow-hidden"
          style={{ height: '80vh' }}
        >
          {/* Шапка модального окна */}
          <OrderHeader
            onClose={onClose}
            orderId={safeStr(notification.orderId)}
            orderStatus={orderStatus}
            onMarkAsRead={handleCloseWithMarkAsRead}
          />

          {/* Полоса прогресса для активных заказов */}
          {!isOrderCancelled(orderStatus) && (
            <div className="bg-gray-100 h-1 w-full">
              <div
                className="bg-blue-500 h-1 rounded-r-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Скроллируемый контент */}
          <div className="flex-grow overflow-y-auto">
            {isLoading && !orderData ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : orderData ? (
              isOrderCancelled(orderStatus) ? (
                <CancelledOrderView orderData={orderData} />
              ) : (
                <>
                  <OrderStageHeader currentStage={currentStage} orderData={orderData} />
                  <OrderMapPreview />

                  <div className="p-5 space-y-4">
                    <OrderRouteDetails
                      orderData={orderData}
                      intermediateAddresses={intermediateAddresses}
                    />

                    {orderData.clientBy && <ClientInfo clientBy={orderData.clientBy} />}
                    {orderData.assignedDriver && <DriverInfo driver={orderData.assignedDriver} />}

                    <OrderPaymentDetails
                      orderData={orderData}
                      intermediateAddresses={intermediateAddresses}
                    />
                    {orderData.description && <OrderNotes description={orderData.description} />}
                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 error-message-container">
                        <p>{error}</p>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              <OrderLoadError message={error || 'Не удалось загрузить данные'} />
            )}
          </div>

          {/* Футер с кнопками действий */}
          <div className="p-5 border-t border-gray-200 sticky bottom-0 bg-white z-10 rounded-b-2xl shadow-inner">
            <div className="flex justify-between gap-4">
              {renderOrderActions({
                userRole: UserRole.Admin,
                notification,
                currentStage,
                orderData,
                isLoading: isLoading || isProcessing,
                onMarkAsRead: handleMarkAsRead,
                onCancelOrder: () => {},
                onEditOrder: handleEditOrder,
                onClose: handleCloseWithMarkAsRead,
                orderStatus: orderStatus,
              })}
            </div>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderAdminModal);
