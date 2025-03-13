'use client';

import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { OrderStatus, DriverAcceptanceStatus, UserRole } from '@prisma/client';
import {
  markNotificationAsRead,
  updateClientOrderStatus,
} from '@widgets/modal/order-management/api/apiOrderModel';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';
import { isOrderCancelled } from '@widgets/modal/order-management/utils/orderUtils';
import { useOrderData } from '@widgets/modal/order-management/hooks/useOrderData';
import { renderOrderActions } from '@widgets/modal/order-management/components/renderOrderActions';
import OrderHeader from '@widgets/modal/order-management/components/OrderHeader';
import CancelledOrderView from '@widgets/modal/order-management/components/CancelledOrderView';
import OrderStageHeader from '@widgets/modal/order-management/components/OrderStageHeader';
import OrderMapPreview from '@widgets/modal/order-management/components/OrderMapPreview';
import OrderRouteDetails from '@widgets/modal/order-management/components/OrderRouteDetails';
import DriverInfo from '@widgets/modal/order-management/components/DriverInfo';
import OrderPaymentDetails from '@widgets/modal/order-management/components/OrderPaymentDetails';
import OrderNotes from '@widgets/modal/order-management/components/OrderNotes';
import OrderLoadError from '@widgets/modal/order-management/components/OrderLoadError';
import { $activeNotification } from '@shared/lib/effector/state/state';

// Безопасная функция для строк
const safeStr = (str: string | null): string => str || '';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Получаем уведомление напрямую из хранилища Effector
  const notification = useUnit($activeNotification);

  console.log('notification в OrderTrackingModal:', notification);

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

  useEffect(() => {
    // Используем данные из orderData для определения статуса
    // Для клиента скрываем статус OVERDUE - показываем как IN_PROGRESS
    if (orderData) {
      if (orderData.status === OrderStatus.CANCELLED && orderStatus !== OrderStatus.CANCELLED) {
        console.log('Получено уведомление об отмене заказа, изменяем статус');
        setOrderStatus(OrderStatus.CANCELLED);
        setCurrentStage(DriverAcceptanceStatus.PENDING);
      } else if (
        orderData.status === OrderStatus.COMPLETED &&
        orderStatus !== OrderStatus.COMPLETED
      ) {
        console.log('Получено уведомление о завершении заказа, изменяем статус');
        setOrderStatus(OrderStatus.COMPLETED);
        setCurrentStage(DriverAcceptanceStatus.COMPLETED);
      } else if (
        orderData.status === OrderStatus.OVERDUE &&
        orderStatus !== OrderStatus.IN_PROGRESS
      ) {
        // Клиент не должен видеть OVERDUE статус - показываем как IN_PROGRESS
        console.log('Заказ просрочен, но клиенту показываем IN_PROGRESS');
        setOrderStatus(OrderStatus.IN_PROGRESS);
        // Оставляем текущий driverAcceptanceStatus без изменений
      }
    }
  }, [orderData, orderStatus, setOrderStatus, setCurrentStage]);

  // Обработчики действий
  const handleCancelOrder = async () => {
    if (!notification.orderId) return;

    setIsProcessing(true);
    try {
      await updateClientOrderStatus({
        uuid: notification.uuid,
        clientId: notification.clientId,
        driverId: notification.driverId,
        orderId: notification.orderId,
        orderStatus: OrderStatus.CANCELLED,
        driverStatus: DriverAcceptanceStatus.CANCELLED,
      });

      setOrderStatus(OrderStatus.CANCELLED);
      setCurrentStage(DriverAcceptanceStatus.PENDING);
      showToast.warn(`Заказ #${notification.orderId.slice(0, 5)} отменён`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Ошибка при отмене заказа:', err);
      setError(err instanceof Error ? err.message : 'Не удалось отменить заказ');
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleCloseWithMarkAsRead = () => {
    // Используем текущий статус заказа
    if (orderStatus === OrderStatus.IN_PROGRESS) {
      onClose();
      return;
    }

    if (notification.read) {
      onClose();
    } else {
      if (
        orderStatus === OrderStatus.PENDING ||
        orderStatus === OrderStatus.PLANNED ||
        orderStatus === OrderStatus.COMPLETED ||
        orderStatus === OrderStatus.CANCELLED ||
        orderStatus === OrderStatus.OVERDUE
      ) {
        handleMarkAsRead();
      } else {
        onClose();
      }
    }
  };

  // Для отображения клиенту - никогда не показываем OVERDUE статус
  const displayOrderStatus =
    orderData?.status === OrderStatus.OVERDUE ? OrderStatus.IN_PROGRESS : orderStatus;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className={'w-[700px]'}>
        <div
          className="relative bg-white rounded-2xl w-full p-0 flex flex-col overflow-hidden"
          style={{ height: '80vh' }}
        >
          {/* Фиксированная шапка с динамическим фоном */}
          <OrderHeader
            onClose={onClose}
            orderId={safeStr(notification.orderId)}
            orderStatus={displayOrderStatus}
            onMarkAsRead={handleCloseWithMarkAsRead}
          />

          {/* Полоска прогресса только для активных заказов */}
          {!isOrderCancelled(displayOrderStatus) && (
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
              isOrderCancelled(displayOrderStatus) ? (
                <CancelledOrderView orderData={orderData} />
              ) : (
                <>
                  <OrderStageHeader
                    currentStage={currentStage}
                    orderData={{ ...orderData, status: displayOrderStatus }}
                  />
                  <OrderMapPreview />

                  <div className="p-5 space-y-4">
                    <OrderRouteDetails
                      orderData={orderData}
                      intermediateAddresses={intermediateAddresses}
                    />
                    {orderData.assignedDriver && <DriverInfo driver={orderData.assignedDriver} />}

                    <OrderPaymentDetails
                      orderData={orderData}
                      intermediateAddresses={intermediateAddresses}
                    />

                    {orderData.description && <OrderNotes description={orderData.description} />}

                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
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

          <div className="p-5 border-t border-gray-200 sticky bottom-0 bg-white z-10 rounded-b-2xl shadow-inner">
            <div className="flex justify-between gap-4">
              {renderOrderActions({
                userRole: UserRole.ClientCorp,
                notification,
                currentStage,
                orderData,
                isLoading: isLoading || isProcessing,
                onMarkAsRead: handleMarkAsRead,
                onCancelOrder: handleCancelOrder,
                onClose: handleCloseWithMarkAsRead,
                orderStatus: displayOrderStatus,
              })}
            </div>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderTrackingModal);
