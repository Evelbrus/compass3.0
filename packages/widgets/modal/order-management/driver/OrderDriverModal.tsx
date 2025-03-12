'use client';

import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { OrderStatus, DriverAcceptanceStatus, UserRole } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';
import {
  markNotificationAsRead,
  updateDriverOrderStatus,
} from '@widgets/modal/order-management/api/apiOrderModel';
import { useOrderData } from '@widgets/modal/order-management/hooks/useOrderData';
import {
  driverStatusToOrderStatus,
  isOrderCancelled,
} from '@widgets/modal/order-management/utils/orderUtils';
import { renderOrderActions } from '@widgets/modal/order-management/components/renderOrderActions';
import OrderHeader from '@widgets/modal/order-management/components/OrderHeader';
import CancelledOrderView from '@widgets/modal/order-management/components/CancelledOrderView';
import OrderStageHeader from '@widgets/modal/order-management/components/OrderStageHeader';
import OrderMapPreview from '@widgets/modal/order-management/components/OrderMapPreview';
import OrderRouteDetails from '@widgets/modal/order-management/components/OrderRouteDetails';
import OrderPaymentDetails from '@widgets/modal/order-management/components/OrderPaymentDetails';
import OrderNotes from '@widgets/modal/order-management/components/OrderNotes';
import ClientInfo from '@widgets/modal/order-management/components/ClientInfo';
import OrderLoadError from '@widgets/modal/order-management/components/OrderLoadError';
import { $activeNotification } from '@shared/lib/effector/state/state';

// Безопасная функция для строк
const safeStr = (str: string | null): string => str || '';

interface OrderDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderDriverModal: React.FC<OrderDriverModalProps> = ({ isOpen, onClose }) => {
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

  useEffect(() => {
    // Получаем данные из orderData, так как orderData содержит все необходимые данные о заказе
    if (
      orderData &&
      orderData.status === OrderStatus.CANCELLED &&
      orderStatus !== OrderStatus.CANCELLED
    ) {
      console.log('Получено уведомление об отмене заказа, изменяем статус');
      setOrderStatus(OrderStatus.CANCELLED);
      setCurrentStage(DriverAcceptanceStatus.PENDING);
    } else if (
      orderData &&
      orderData.status === OrderStatus.COMPLETED &&
      orderStatus !== OrderStatus.COMPLETED
    ) {
      console.log('Получено уведомление о завершении заказа, изменяем статус');
      setOrderStatus(OrderStatus.COMPLETED);
      setCurrentStage(DriverAcceptanceStatus.COMPLETED);
    }
  }, [orderData, orderStatus, setOrderStatus, setCurrentStage]);

  // Обработчик действий водителя (принятие, завершение, отмена заказа)
  const handleDriverAction = async (
    driverStatus: DriverAcceptanceStatus,
    actionOrderStatus: OrderStatus,
    successMessage: string,
    errorMessage: string,
  ) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Если заказ OVERDUE, не используем driverStatusToOrderStatus, а берём actionOrderStatus напрямую
      const newOrderStatus =
        actionOrderStatus === OrderStatus.OVERDUE
          ? OrderStatus.OVERDUE
          : actionOrderStatus === OrderStatus.CANCELLED
            ? OrderStatus.CANCELLED
            : driverStatusToOrderStatus[driverStatus];

      if (notification.orderId) {
        await updateDriverOrderStatus({
          uuid: notification.uuid,
          clientId: notification.clientId,
          driverId: notification.driverId,
          orderId: notification.orderId,
          driverStatus: driverStatus,
          orderStatus: newOrderStatus,
        });

        setCurrentStage(driverStatus);
        setOrderStatus(newOrderStatus);
        showToast[actionOrderStatus === OrderStatus.COMPLETED ? 'success' : 'warn'](
          successMessage,
          {
            position: 'top-right',
            autoClose: 3000,
          },
        );

        if (actionOrderStatus !== OrderStatus.CANCELLED) {
          onClose();
        }
      }
    } catch (err) {
      // Обработка ошибок остаётся без изменений
      console.error('Ошибка при обновлении статуса:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (errorMsg.includes('занят другими активными заказами')) {
        const errorText = 'Вы уже заняты другими заказами. Сначала завершите текущие заказы.';
        setError(errorText);
        showToast.error('Вы уже заняты другими заказами', {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        setError(errorMessage);
        showToast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик отметки уведомления как прочитанного
  const handleMarkAsRead = async () => {
    if (notification.read) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
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

  // Обработчик закрытия модального окна с отметкой "прочитано"
  const handleCloseWithMarkAsRead = () => {
    // Используем текущий статус заказа из orderData
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
                    <ClientInfo clientBy={orderData.clientBy} />
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
                userRole: UserRole.Driver,
                notification,
                currentStage,
                orderData,
                isLoading: isLoading || isProcessing,
                onMarkAsRead: handleMarkAsRead,
                onCancelOrder: () => {},
                onDriverAction: handleDriverAction,
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

export default React.memo(OrderDriverModal);
