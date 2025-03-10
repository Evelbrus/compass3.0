import React from 'react';
import { OrderStatus } from '@prisma/client';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import { getHeaderBackground } from '@widgets/modal/order-management/utils/orderUtils';

interface OrderHeaderProps {
  onClose: () => void;
  orderId: string;
  orderStatus: OrderStatus;
  onMarkAsRead?: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  onClose,
  orderId,
  orderStatus,
  onMarkAsRead,
}) => {
  // Обработчик закрытия с отметкой "прочитано"
  const handleClose = () => {
    if (onMarkAsRead) {
      onMarkAsRead(); // Если функция передана, отмечаем уведомление как прочитанное
    }
    onClose();
  };

  // Функция для безопасной обработки orderId
  const safeOrderId = orderId ? orderId.slice(0, 5) : 'N/A';

  return (
    <div
      className={`flex justify-between items-center p-5 sticky top-0 z-10 rounded-t-2xl text-white ${getHeaderBackground(orderStatus)}`}
    >
      <IButton
        variant="close"
        onClick={handleClose}
        aria-label="Закрыть модальное окно"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        <CloseIcon />
      </IButton>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold">Заказ #{safeOrderId}</h2>
        <div className="flex items-center mt-1">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              orderStatus === OrderStatus.OVERDUE
                ? 'bg-yellow-400 animate-pulse'
                : orderStatus === OrderStatus.COMPLETED
                  ? 'bg-green-400'
                  : orderStatus === OrderStatus.CANCELLED
                    ? 'bg-red-400'
                    : 'bg-blue-400 animate-pulse'
            }`}
          ></span>
          <span className="text-sm font-medium text-gray-100">
            {orderStatus === OrderStatus.OVERDUE
              ? 'Просрочен'
              : orderStatus === OrderStatus.COMPLETED
                ? 'Завершён'
                : orderStatus === OrderStatus.CANCELLED
                  ? 'Отменён'
                  : orderStatus === OrderStatus.PLANNED
                    ? 'Уведомление'
                    : orderStatus === OrderStatus.IN_PROGRESS
                      ? 'В процессе'
                      : 'Ожидает'}
          </span>
        </div>
      </div>
      <div className="w-8"></div>
    </div>
  );
};

export default OrderHeader;
