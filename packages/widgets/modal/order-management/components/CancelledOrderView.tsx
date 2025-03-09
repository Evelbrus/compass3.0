import React from 'react';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface CancelledOrderViewProps {
  orderData: OrderDetail;
}

const CancelledOrderView: React.FC<CancelledOrderViewProps> = ({ orderData }) => {
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className="p-5 space-y-4">
      {/* Уведомление об отмене */}
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
        <p className="text-lg font-semibold">Заказ отменён</p>
        <p className="mt-2">Этот заказ был отменён, дальнейшие действия невозможны.</p>
      </div>

      {/* Маршрут поездки */}
      <div className={cardClass}>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Маршрут поездки</h3>
        <div className="space-y-4 relative">
          <div className="flex">
            <div className="mr-3 relative">
              <div className="w-3 h-3 rounded-full bg-green-500 z-10 relative"></div>
              <div className="absolute top-3 bottom-0 left-1.5 w-0.5 bg-gray-300 -ml-px"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{orderData.departurePoint.address}</p>
            </div>
          </div>
          <div className="flex">
            <div className="mr-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{orderData.arrivalPoint.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Детали оплаты */}
      <div className={cardClass}>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Детали оплаты</h3>
        <div className="text-center text-gray-500">
          <span className="text-sm bg-gray-50 px-2 py-1 rounded-full">
            Оплата не будет произведена из-за отмены заказа
          </span>
        </div>
      </div>

      {/* Заметки к заказу */}
      {orderData.description && (
        <div className={cardClass}>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Заметки к заказу</h3>
          <p className="text-gray-700">{orderData.description}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(CancelledOrderView);
