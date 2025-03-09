'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { Action, UserRole } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { showToast } from '@shared/components/toast/ToastManager';
import { isOrderCancelled } from '@widgets/modal/order-management/utils/orderUtils';
import { useOrderData } from '@widgets/modal/order-management/hooks/useOrderData';
import { renderOrderActions } from '@widgets/modal/order-management/components/renderOrderActions';
import { markAdminNotificationAsRead } from '@widgets/modal/order-management/api/apiOrderModel';
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

  console.log('notification', notification);

  // Используем хук для загрузки данных заказа
  const {
    orderData,
    currentStage,
    orderStatus,
    isLoading,
    error,
    intermediateAddresses,
    progress,
  } = useOrderData(notification.orderId, isOpen);

  // Обработчик отметки уведомления как прочитанного
  const handleMarkAsRead = async () => {
    setIsProcessing(true);
    try {
      await markAdminNotificationAsRead({
        orderUuid: notification.orderId,
        notificationUuid: notification.uuid,
        userId: notification.userId,
        createdById: notification.createdById,
        action: notification.action,
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
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик редактирования заказа
  const handleEditOrder = () => {
    if (notification.orderId) {
      router.push(`/order/edit/${notification.orderId}`);
      onClose();
    }
  };

  // Обработчик закрытия модального окна с отметкой "прочитано"
  const handleCloseWithMarkAsRead = () => {
    handleMarkAsRead();
    onClose();
  };

  // Для предупреждений и отмен используем специальный шаблон с сообщением
  if (notification.action === Action.warning || notification.action === Action.cancelled) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="w-full max-w-lg">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {notification.action === Action.warning ? 'Предупреждение' : 'Заказ отменен'}
                </h2>
                <button
                  onClick={handleCloseWithMarkAsRead}
                  className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors"
                  aria-label="Закрыть"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-lg font-medium mb-4">{notification.title}</p>
              <p className="text-gray-600 whitespace-pre-line mb-6">{notification.message}</p>

              {notification.orderId && (
                <p className="mt-4 text-gray-500">
                  ID заказа:{' '}
                  <span className="font-medium text-gray-800">{notification.orderId}</span>
                </p>
              )}

              <div className="flex justify-end gap-3 mt-8">
                {notification.orderId && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
                    onClick={handleEditOrder}
                  >
                    Редактировать
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleCloseWithMarkAsRead}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

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
            orderId={notification.orderId}
            action={notification.action}
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

                    {orderData.createdBy && <ClientInfo createdBy={orderData.createdBy} />}
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
              })}
            </div>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default React.memo(OrderAdminModal);
