// components/OrderHeader.tsx
import React from 'react';
import { Action } from '@prisma/client';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';
import { getHeaderBackground } from '../utils/orderUtils';

interface OrderHeaderProps {
  onClose: () => void;
  orderId: string;
  action: Action;
  onMarkAsRead?: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ onClose, orderId, action, onMarkAsRead }) => {
  // Обработчик закрытия с отметкой "прочитано"
  const handleClose = () => {
    if (onMarkAsRead) {
      onMarkAsRead(); // Если функция передана, отмечаем уведомление как прочитанное
    }
    onClose();
  };

  return (
    <div
      className={`flex justify-between items-center p-5 sticky top-0 z-10 rounded-t-2xl text-white ${getHeaderBackground(action)}`}
    >
      <IButton
        variant="close"
        onClick={handleClose} // Используем новый обработчик
        aria-label="Закрыть модальное окно"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        <CloseIcon />
      </IButton>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold">Заказ #{orderId?.slice(0, 5) || 'N/A'}</h2>
        <div className="flex items-center mt-1">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              action === Action.warning
                ? 'bg-yellow-400 animate-pulse'
                : action === Action.success
                  ? 'bg-green-400'
                  : action === Action.cancelled
                    ? 'bg-red-400'
                    : 'bg-blue-400 animate-pulse'
            }`}
          ></span>
          <span className="text-sm font-medium text-gray-100">
            {action === Action.warning
              ? 'Просрочен'
              : action === Action.success
                ? 'Завершён'
                : action === Action.cancelled
                  ? 'Отменён'
                  : action === Action.noted
                    ? 'Уведомление'
                    : 'В процессе'}
          </span>
        </div>
      </div>
      <div className="w-8"></div>
    </div>
  );
};

export default OrderHeader;
