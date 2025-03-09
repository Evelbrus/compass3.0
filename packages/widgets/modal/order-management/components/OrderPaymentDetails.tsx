import React, { useState } from 'react';
import { getWaitingPrice, getTotalPrice } from '@widgets/modal/order-management/utils/orderUtils';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface OrderPaymentDetailsProps {
  orderData: OrderDetail;
  intermediateAddresses: string[];
}

const OrderPaymentDetails: React.FC<OrderPaymentDetailsProps> = ({
  orderData,
  intermediateAddresses,
}) => {
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-medium text-gray-800 mb-3">Детали оплаты</h3>
      <div className="space-y-2">
        {/* Тариф */}
        <div className="flex justify-between">
          <span className="text-gray-600">Тариф "{orderData.tariff.name}"</span>
          <span className="font-medium">{orderData.tariff.price} сом</span>
        </div>

        {/* Ожидание */}
        {orderData.waitingTimeMinutes !== undefined && orderData.waitingTimeMinutes > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Ожидание ({orderData.waitingTimeMinutes} мин)</span>
            <span className="font-medium">{getWaitingPrice(orderData)} сом</span>
          </div>
        )}

        {/* Промежуточные остановки */}
        {intermediateAddresses.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Промежуточные остановки</span>
            <span className="font-medium"> сом</span> {/* Здесь можно добавить цену */}
          </div>
        )}

        {/* Дополнительные услуги */}
        {orderData.additionalServices && orderData.additionalServices.length > 0 && (
          <>
            <button
              className="text-blue-500 hover:underline text-sm flex items-center"
              onClick={() => setShowAdditionalServices(!showAdditionalServices)}
            >
              {showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-1 transition-transform ${showAdditionalServices ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showAdditionalServices && (
              <div className="pl-4 space-y-1 border-l-2 border-blue-100">
                {orderData.additionalServices.map((service) => (
                  <div key={service.uuid} className="flex justify-between text-sm">
                    <span className="text-gray-600">{service.name}</span>
                    <span className="font-medium">{service.price} сом</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Итого */}
        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-semibold">
          <span>Итого</span>
          <span className="text-lg text-blue-700">{getTotalPrice(orderData)} сом</span>
        </div>
      </div>

      {/* Способ оплаты */}
      <div className="mt-3 text-center">
        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          Способ оплаты: наличные
        </span>
      </div>
    </div>
  );
};

export default React.memo(OrderPaymentDetails);
